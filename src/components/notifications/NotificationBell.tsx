"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  Building2,
  Sparkles,
  Info,
  ShieldAlert,
  Clock,
  ExternalLink,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Layers,
  ArrowRight,
  CreditCard,
  CalendarClock,
  AlertTriangle,
  Globe,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useNotifications, UserNotification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BusinessConfirmationModal } from "@/components/business/BusinessConfirmationModal";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import { cn } from "@/lib/utils/cn";

export function NotificationBell() {
  const { currentRole, currentUser } = useCurrentRole();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    soundEnabled,
    toggleSound,
    confirmingBizId,
    setConfirmingBizId,
    quickConfirmListing,
    refresh,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "role" | "common" | "confirmations" | "unread">("all");
  const [isOpen, setIsOpen] = useState(false);

  const ROLE_CONFIG: Record<
    string,
    { label: string; icon: string; badgeClass: string; desc: string }
  > = {
    user: {
      label: "Customer / Local User",
      icon: "👤",
      badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
      desc: "Community discovery & personal updates",
    },
    owner: {
      label: "Business Owner",
      icon: "💼",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      desc: "Listing performance & customer inquiries",
    },
    city_admin: {
      label: "City Admin",
      icon: "🏙️",
      badgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      desc: "Municipal verification & compliance",
    },
    country_admin: {
      label: "Country Admin",
      icon: "🌍",
      badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      desc: "National directory & territory leads",
    },
    admin: {
      label: "Operations Admin",
      icon: "🛡️",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      desc: "Moderation, reviews & dispute handling",
    },
    super_admin: {
      label: "Super Admin",
      icon: "👑",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      desc: "Root platform control & global oversight",
    },
  };

  const activeRoleConfig = ROLE_CONFIG[currentRole] || ROLE_CONFIG.user;

  const isCommonNotification = (n: UserNotification) =>
    n.target === "global" ||
    n.targetRole === "all" ||
    n.targetRole === "global" ||
    (n.type === "broadcast" && (!n.targetRole || n.targetRole === "all"));

  const commonNotifications = notifications.filter(isCommonNotification);
  const roleNotifications = notifications.filter((n) => !isCommonNotification(n));
  const confirmationNotifications = notifications.filter(
    (n) => n.actionType === "business_confirmation" || Boolean(n.targetBusinessId)
  );

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : filter === "confirmations"
      ? confirmationNotifications
      : filter === "role"
      ? roleNotifications
      : filter === "common"
      ? commonNotifications
      : notifications;

  const getNotificationIcon = (n: UserNotification) => {
    if (n.actionType === "business_existence_confirmation") {
      return <CalendarClock className="w-4 h-4 text-amber-500" />;
    }
    if (n.actionType === "subscription_due") {
      return <CreditCard className="w-4 h-4 text-indigo-500" />;
    }
    if (
      n.actionType === "business_confirmation" ||
      n.target === "admin" ||
      n.targetRole === "super_admin"
    ) {
      return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    }
    if (n.target === "country_admin" || n.targetRole === "country_admin") {
      return <Globe className="w-4 h-4 text-indigo-500" />;
    }
    if (n.target === "city_admin" || n.targetRole === "city_admin") {
      return <Building2 className="w-4 h-4 text-cyan-500" />;
    }
    if (n.target === "business" || n.targetRole === "owner") {
      return <Building2 className="w-4 h-4 text-emerald-500" />;
    }
    if (n.type === "alert" || n.status === "Pending") {
      return <ShieldAlert className="w-4 h-4 text-rose-500" />;
    }
    if (isCommonNotification(n)) {
      return <Globe className="w-4 h-4 text-sky-500" />;
    }
    return <Sparkles className="w-4 h-4 text-primary" />;
  };

  const getScopeBadge = (n: UserNotification) => {
    if (isCommonNotification(n)) {
      return (
        <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
          <Globe className="w-2.5 h-2.5" />
          Common
        </Badge>
      );
    }
    if (n.targetRole === "super_admin" || n.target === "super_admin") {
      return (
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
          <Crown className="w-2.5 h-2.5" />
          Super Admin
        </Badge>
      );
    }
    if (n.targetRole === "country_admin" || n.target === "country_admin") {
      return (
        <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
          <Globe className="w-2.5 h-2.5" />
          Country Admin
        </Badge>
      );
    }
    if (n.targetRole === "city_admin" || n.target === "city_admin") {
      return (
        <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
          <Building2 className="w-2.5 h-2.5" />
          City Admin
        </Badge>
      );
    }
    if (n.targetRole === "admin" || n.target === "admin") {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
          <Shield className="w-2.5 h-2.5" />
          Operations
        </Badge>
      );
    }
    if (n.targetRole === "owner" || n.target === "business") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
          <Building2 className="w-2.5 h-2.5" />
          Business
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5">
        <User className="w-2.5 h-2.5" />
        Personal
      </Badge>
    );
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/80 text-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Bell
              className={`w-4 h-4 ${
                unreadCount > 0
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground"
              } transition-colors`}
            />
            {unreadCount > 0 && (
              <>
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-[10px] font-bold text-white shadow-md animate-in zoom-in-50">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
                <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-indigo-500 opacity-75 animate-ping pointer-events-none" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-88 sm:w-[460px] p-0 rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 bg-muted/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>Alerts & Notifications</span>
                    {unreadCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[10px] font-bold bg-primary/10 text-primary border-primary/20"
                      >
                        {unreadCount} new
                      </Badge>
                    )}
                  </h3>
                </div>
                {/* Active Role Identifier */}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-medium text-muted-foreground">Showing for:</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0 font-semibold flex items-center gap-1",
                      activeRoleConfig.badgeClass
                    )}
                  >
                    <span>{activeRoleConfig.icon}</span>
                    <span>{activeRoleConfig.label}</span>
                    {currentUser?.assignedCity && currentRole === "city_admin" && (
                      <span className="opacity-80">• {currentUser.assignedCity}</span>
                    )}
                    {currentUser?.assignedCountry && currentRole === "country_admin" && (
                      <span className="opacity-80">• {currentUser.assignedCountry}</span>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border/40 bg-muted/20 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all text-xs shrink-0",
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setFilter("role")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1 shrink-0",
                filter === "role"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span>{activeRoleConfig.icon}</span>
              <span>My Role</span>
              <span className="text-[10px] ml-0.5 opacity-80">({roleNotifications.length})</span>
            </button>

            <button
              onClick={() => setFilter("common")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1 shrink-0",
                filter === "common"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Globe className="w-3 h-3" />
              <span>Common</span>
              <span className="text-[10px] ml-0.5 opacity-80">({commonNotifications.length})</span>
            </button>

            {confirmationNotifications.length > 0 && (
              <button
                onClick={() => setFilter("confirmations")}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1 shrink-0",
                  filter === "confirmations"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Confirmations</span>
                <span className="text-[10px] ml-0.5 px-1 py-0 rounded bg-white/20 font-bold">
                  {confirmationNotifications.length}
                </span>
              </button>
            )}

            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-semibold transition-all text-xs shrink-0",
                filter === "unread"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/30">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">No notifications</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {filter === "role"
                    ? `No role-specific notifications for ${activeRoleConfig.label}.`
                    : filter === "common"
                    ? "No common system announcements right now."
                    : filter === "confirmations"
                    ? "No pending business confirmations right now."
                    : filter === "unread"
                    ? "You're all caught up! No unread notifications."
                    : "You don't have any notifications right now."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const isConfirmation =
                  notif.actionType === "business_confirmation" ||
                  Boolean(notif.targetBusinessId);
                const isNewUser = notif.metadata?.isNewUser === true;

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id);
                    }}
                    className={cn(
                      "p-3.5 flex flex-col gap-2 transition-colors cursor-pointer select-none",
                      notif.isRead
                        ? "bg-transparent hover:bg-muted/30 opacity-80 hover:opacity-100"
                        : "bg-primary/[0.04] hover:bg-primary/[0.08]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-xl bg-muted/80 flex items-center justify-center shadow-xs">
                          {getNotificationIcon(notif)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Scope & Context Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          {getScopeBadge(notif)}

                          {notif.actionType === "business_existence_confirmation" && (
                            <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                              <CalendarClock className="w-2.5 h-2.5" />
                              4-Month Audit Review
                            </Badge>
                          )}
                          {notif.actionType === "subscription_due" && (
                            <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 text-[9px] font-bold px-1.5 py-0 flex items-center gap-1">
                              <CreditCard className="w-2.5 h-2.5" />
                              Subscription Due
                            </Badge>
                          )}
                          {isConfirmation &&
                            notif.actionType !== "business_existence_confirmation" && (
                              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[9px] font-bold px-1.5 py-0">
                                Confirmation Alert
                              </Badge>
                            )}

                          {/* Priority Indicator */}
                          {notif.priority === "critical" && (
                            <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[9px] font-bold px-1.5 py-0 flex items-center gap-0.5 animate-pulse">
                              <span>🚨</span>
                              <span>Critical</span>
                            </Badge>
                          )}
                          {notif.priority === "high" && (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold px-1.5 py-0">
                              High
                            </Badge>
                          )}

                          {/* Geographic Territory Badges */}
                          {notif.targetCity && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">
                              🏙️ {notif.targetCity}
                            </Badge>
                          )}
                          {notif.targetCountry && !notif.targetCity && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                              🌍 {notif.targetCountry}
                            </Badge>
                          )}

                          {/* Delivery Channels */}
                          {Array.isArray(notif.channels) && notif.channels.length > 0 && (
                            <div className="flex items-center gap-0.5 opacity-70 ml-0.5">
                              {notif.channels.includes("in_app") && (
                                <span title="Delivered via In-App" className="text-[9px]">📱</span>
                              )}
                              {notif.channels.includes("email") && (
                                <span title="Delivered via Email" className="text-[9px]">✉️</span>
                              )}
                              {notif.channels.includes("push") && (
                                <span title="Delivered via Push" className="text-[9px]">🔔</span>
                              )}
                            </div>
                          )}

                          {isNewUser && (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] font-bold px-1.5 py-0">
                              ✨ New User
                            </Badge>
                          )}
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 ml-auto" />
                          )}
                        </div>

                        <p
                          className={cn(
                            "text-xs leading-snug",
                            notif.isRead
                              ? "text-muted-foreground font-medium"
                              : "text-foreground font-bold"
                          )}
                        >
                          {notif.title}
                        </p>

                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                          {notif.body}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/80">
                          <Clock className="w-3 h-3" />
                          <span>{notif.sent}</span>
                          {notif.sentBy && (
                            <>
                              <span>•</span>
                              <span>{notif.sentBy}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Action Bar on 4-Month Existence, Subscription & Confirmation Alerts */}
                    {notif.targetBusinessId && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40 mt-1 flex-wrap">
                        {notif.actionType === "business_existence_confirmation" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch(
                                  `/api/businesses/${notif.targetBusinessId}/confirm-existence`,
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      actorName: currentUser?.name || "Owner",
                                      actorRole: currentRole,
                                      notes: "Confirmed active via quick notification action.",
                                    }),
                                  }
                                );
                                const data = await res.json();
                                if (data.success) {
                                  toast.success(`✨ Business Confirmed!`, {
                                    description: `Your business existence is active for the next 4 months.`,
                                  });
                                  markAsRead(notif.id);
                                  refresh();
                                } else {
                                  toast.error(
                                    data.error || "Failed to confirm business existence."
                                  );
                                }
                              } catch (err) {
                                toast.error("Error confirming existence. Please try again.");
                              }
                            }}
                            className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 rounded-lg shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm Business Exists</span>
                          </Button>
                        )}

                        {notif.actionType === "subscription_due" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              window.location.href = `/billing?businessId=${notif.targetBusinessId}`;
                            }}
                            className="h-7 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1 px-2.5 rounded-lg shadow-xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Subscription Fee</span>
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notif.targetBusinessId) {
                              setConfirmingBizId(notif.targetBusinessId);
                              setIsOpen(false);
                            }
                          }}
                          className="h-7 text-[11px] font-bold text-primary hover:bg-primary/10 gap-1 px-2.5 rounded-lg"
                        >
                          <span>Review & Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Inspection Modal */}
      {confirmingBizId && (
        <BusinessConfirmationModal
          businessId={confirmingBizId}
          isOpen={Boolean(confirmingBizId)}
          onClose={() => setConfirmingBizId(null)}
          onSuccess={() => {
            refresh();
          }}
        />
      )}
    </>
  );
}
