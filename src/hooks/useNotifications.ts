"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import { toast } from "sonner";
import { NotificationTarget, NotificationPriority } from "@/types/notification";

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  target: NotificationTarget;
  targetUserId?: string;
  targetBusinessId?: string;
  targetRole?: string;
  targetCountry?: string;
  targetCity?: string;
  actionType?: string;
  metadata?: Record<string, any>;
  status: string;
  priority?: NotificationPriority;
  sentBy: string;
  type?: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  sent: string;
}

// Synthesize a gentle, modern harmonic chime via Web Audio API
export function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const isMuted = localStorage.getItem("bizfinder_sound_enabled") === "false";
    if (isMuted) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playTone = (
      freq: number,
      delay: number,
      duration: number,
      gainVal: number
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        ctx.currentTime + delay + duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    // Polite, dual-tone harmonic chime (E5 -> B5)
    playTone(659.25, 0, 0.35, 0.12);
    playTone(987.77, 0.08, 0.45, 0.15);
  } catch (err) {
    console.debug("[Audio] Notification chime suppressed:", err);
  }
}

// Request and dispatch Browser Desktop Notification
export async function requestDesktopNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

export function showDesktopNotification(
  title: string,
  body: string,
  icon = "/favicon.ico"
) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        silent: true,
      });
    } catch {}
  }
}

export function useNotifications() {
  const { isSignedIn, isLoaded } = useUser();
  const { currentRole, currentUser } = useCurrentRole();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [confirmingBizId, setConfirmingBizId] = useState<string | null>(null);

  const prevCountRef = useRef<number>(0);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());

  // Initialize sound preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bizfinder_sound_enabled");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("bizfinder_sound_enabled", String(next));
      }
      if (next) {
        playNotificationSound();
      }
      return next;
    });
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      params.set("role", currentRole || "owner");

      if (currentUser?.id) {
        params.set("userId", currentUser.id);
      }
      if (currentUser?.assignedCountry) {
        params.set("country", currentUser.assignedCountry);
      }
      if (currentUser?.assignedCity) {
        params.set("city", currentUser.assignedCity);
      }

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          const freshList: UserNotification[] = data.notifications;
          const freshUnread =
            data.unreadCount ?? freshList.filter((n) => !n.isRead).length;

          // Check for brand new incoming notifications
          const hasInitialRun = knownNotifIdsRef.current.size > 0;
          const newItems = freshList.filter(
            (n) => !knownNotifIdsRef.current.has(n.id) && !n.isRead
          );

          if (hasInitialRun && newItems.length > 0) {
            playNotificationSound();

            // Display rich toast alert for confirmation items
            const confirmationItem = newItems.find(
              (n) => n.actionType === "business_confirmation"
            ) || newItems[0];

            if (confirmationItem) {
              const roleTitle =
                currentRole === "super_admin"
                  ? "👑 Super Admin Confirmation"
                  : currentRole === "country_admin"
                  ? "🌍 Country Admin Verification"
                  : currentRole === "city_admin"
                  ? "🏙️ City Admin Confirmation"
                  : "🔔 New Notification";

              toast(roleTitle, {
                description: confirmationItem.title,
                action: confirmationItem.targetBusinessId
                  ? {
                      label: "Review / Confirm",
                      onClick: () => {
                        if (confirmationItem.targetBusinessId) {
                          setConfirmingBizId(confirmationItem.targetBusinessId);
                        }
                      },
                    }
                  : undefined,
                duration: 8000,
              });

              showDesktopNotification(confirmationItem.title, confirmationItem.body);
            }
          }

          // Update known IDs
          freshList.forEach((n) => knownNotifIdsRef.current.add(n.id));
          prevCountRef.current = freshUnread;
          setNotifications(freshList);
          setUnreadCount(freshUnread);
        }
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentRole, currentUser]);

  // Initial fetch and role change fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-polling every 8 seconds for real-time alerts
  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications();
    }, 8000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", notificationId }),
      });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  }, []);

  const markAsUnread = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n))
    );
    setUnreadCount((prev) => prev + 1);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markUnread", notificationId }),
      });
    } catch (err) {
      console.error("Failed to mark notification unread", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markAllRead",
          role: currentRole,
          userId: currentUser?.id,
        }),
      });
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  }, [currentRole, currentUser]);

  const clearAllRead = useCallback(async () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clearAllRead" }),
      });
    } catch (err) {
      console.error("Failed to clear read notifications", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    setNotifications((prev) => {
      const item = prev.find((n) => n.id === notificationId);
      if (item && !item.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.filter((n) => n.id !== notificationId);
    });

    try {
      await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  }, []);

  // One-click quick confirm/approve a business listing directly from notifications
  const quickConfirmListing = useCallback(
    async (businessId: string, customAction?: string, notes?: string) => {
      let actionToUse = customAction;
      if (!actionToUse) {
        if (currentRole === "city_admin") actionToUse = "city_approve";
        else if (currentRole === "country_admin") actionToUse = "country_approve";
        else actionToUse = "super_admin_approve";
      }

      try {
        const res = await fetch(`/api/businesses/${businessId}/approval`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: actionToUse,
            actorName: currentUser?.name || "Administrator",
            actorRole: currentRole,
            notes: notes || `Direct confirmation verified by ${currentUser?.name || currentRole}`,
          }),
        });

        if (res.ok) {
          toast.success("Listing Confirmed & Updated", {
            description: `Successfully processed ${actionToUse.replace(/_/g, " ")} for listing.`,
          });
          // Mark associated notification as read
          const related = notifications.find(
            (n) => n.targetBusinessId === businessId
          );
          if (related) {
            markAsRead(related.id);
          }
          fetchNotifications();
          return true;
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error("Confirmation Failed", {
            description: err.error || "Unable to confirm listing.",
          });
          return false;
        }
      } catch (err: any) {
        toast.error("Network Error", {
          description: err.message || "Failed to contact confirmation server.",
        });
        return false;
      }
    },
    [currentRole, currentUser, notifications, markAsRead, fetchNotifications]
  );

  return {
    notifications,
    unreadCount,
    isLoading,
    soundEnabled,
    confirmingBizId,
    setConfirmingBizId,
    toggleSound,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    clearAllRead,
    deleteNotification,
    quickConfirmListing,
    refresh: fetchNotifications,
  };
}
