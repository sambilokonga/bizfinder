"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Send,
  Building2,
  Users,
  Globe,
  Shield,
  Sparkles,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  Lock,
  Tag,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  INotification,
  NotificationPriority,
  NotificationTarget,
  NotificationType,
} from "@/types/notification";

interface RegisterNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRegistered: (notif: INotification) => void;
  currentSenderName?: string;
  defaultTarget?: NotificationTarget;
  isOwnerView?: boolean;
  preselectedBusinessId?: string;
}

export function RegisterNotificationModal({
  isOpen,
  onClose,
  onNotificationRegistered,
  currentSenderName = "Super Admin",
  defaultTarget = "global",
  isOwnerView = false,
}: RegisterNotificationModalProps) {
  const [target, setTarget] = useState<NotificationTarget>(defaultTarget);
  const [type, setType] = useState<NotificationType>("system");
  const [priority, setPriority] = useState<NotificationPriority>("medium");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [sentBy, setSentBy] = useState(currentSenderName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TARGET_OPTIONS: Array<{
    target: NotificationTarget;
    label: string;
    icon: React.ReactNode;
    color: string;
    desc: string;
  }> = [
    {
      target: "global",
      label: "Global Broadcast",
      icon: <Globe className="w-4 h-4 text-blue-500" />,
      color: "border-blue-500/30 bg-blue-500/5",
      desc: "All registered users & directory visitors",
    },
    {
      target: "business",
      label: "Business Owners",
      icon: <Building2 className="w-4 h-4 text-emerald-500" />,
      color: "border-emerald-500/30 bg-emerald-500/5",
      desc: "Verified merchants, claims & listings",
    },
    {
      target: "user",
      label: "Individual User",
      icon: <Users className="w-4 h-4 text-purple-500" />,
      color: "border-purple-500/30 bg-purple-500/5",
      desc: "Targeted direct customer delivery",
    },
    {
      target: "admin",
      label: "Administrative Team",
      icon: <Shield className="w-4 h-4 text-rose-500" />,
      color: "border-rose-500/30 bg-rose-500/5",
      desc: "Super Admins, Country & City Leads",
    },
  ];

  const TYPE_OPTIONS: Array<{
    type: NotificationType;
    label: string;
    icon: React.ReactNode;
  }> = [
    { type: "system", label: "System & Infrastructure", icon: <Bell className="w-3.5 h-3.5 text-blue-500" /> },
    { type: "verification", label: "Verification & Compliance", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
    { type: "review", label: "Customer Review Feedback", icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { type: "payment", label: "Payment & Financial Ledger", icon: <CreditCard className="w-3.5 h-3.5 text-green-500" /> },
    { type: "security", label: "Security Alert & 2FA", icon: <Lock className="w-3.5 h-3.5 text-red-500" /> },
    { type: "promo", label: "Promotional & Marketing Boost", icon: <Tag className="w-3.5 h-3.5 text-purple-500" /> },
    { type: "dispute", label: "Dispute & Incident Notice", icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> },
  ];

  const PRESETS = [
    {
      title: "Business Verification Approved",
      body: "Your submitted commercial business documents have been verified. Your listing now proudly displays the official verified badge!",
      target: "business" as NotificationTarget,
      type: "verification" as NotificationType,
      priority: "high" as NotificationPriority,
    },
    {
      title: "Scheduled Maintenance Window",
      body: "We are conducting database infrastructure maintenance tonight between 02:00 and 03:30 AM EAT. Service availability may be momentarily intermittent.",
      target: "global" as NotificationTarget,
      type: "system" as NotificationType,
      priority: "critical" as NotificationPriority,
    },
    {
      title: "Holiday Promotion Discount Boost",
      body: "Special seasonal promotion: Enjoy 30% bonus impressions on all sponsored search placement campaigns for the upcoming holiday festival!",
      target: "business" as NotificationTarget,
      type: "promo" as NotificationType,
      priority: "medium" as NotificationPriority,
    },
    {
      title: "Security Shield Alert: 2FA Enforcement",
      body: "Please verify your account security credentials and enable two-factor authentication to keep your business dashboard protected.",
      target: "admin" as NotificationTarget,
      type: "security" as NotificationType,
      priority: "high" as NotificationPriority,
    },
  ];

  const handleApplyPreset = (p: (typeof PRESETS)[0]) => {
    setTitle(p.title);
    setBody(p.body);
    setTarget(p.target);
    setType(p.type);
    setPriority(p.priority);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a notification title.");
      return;
    }
    if (!body.trim()) {
      toast.error("Please provide notification message content.");
      return;
    }

    setIsSubmitting(true);
    const endpoint = isOwnerView ? "/api/notifications" : "/api/admin/notifications";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          target,
          type,
          priority,
          link: link.trim() || undefined,
          targetUserId: targetUserId.trim() || undefined,
          sentBy: sentBy.trim() || currentSenderName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.notification) {
        toast.success(
          `Notification "${title.trim()}" dispatched successfully to ${target} recipients! Registered to MongoDB.`
        );
        onNotificationRegistered(data.notification);
        onClose();
        // Reset form
        setTitle("");
        setBody("");
        setLink("");
        setTargetUserId("");
      } else {
        toast.error(data?.error || "Failed to register notification");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error registering notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-border bg-card">
        {/* Modal Header */}
        <div className="p-6 border-b border-border bg-muted/20 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground tracking-tight">
                Register Real Notification
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Dispatch an authentic, database-backed alert to users, business owners, or administrative staff.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets Carousel */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              <span>Quick Preset Templates</span>
              <span className="text-[10px] lowercase text-primary font-semibold">Click to auto-fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 rounded-xl border border-border text-left hover:border-primary/50 hover:bg-muted/40 transition-all text-xs group"
                >
                  <div className="font-bold text-foreground group-hover:text-primary line-clamp-1">
                    {p.title}
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {p.body}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience Selector */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
              Target Recipient Scope <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TARGET_OPTIONS.map((t) => {
                const isSelected = target === t.target;
                return (
                  <button
                    key={t.target}
                    type="button"
                    onClick={() => setTarget(t.target)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {t.icon}
                      <span className="text-xs font-bold text-foreground">{t.label}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific User ID Input if user target selected */}
          {target === "user" && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Target User ID / Clerk ID (Optional)
              </label>
              <Input
                placeholder="e.g. user_2tQ... (Leave empty to deliver to active user session)"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="text-xs"
              />
            </div>
          )}

          {/* Type & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Notification Category <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Delivery Priority <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 h-9">
                {(
                  [
                    { id: "critical", label: "Critical", badge: "🔴" },
                    { id: "high", label: "High", badge: "🟠" },
                    { id: "medium", label: "Medium", badge: "🔵" },
                    { id: "low", label: "Low", badge: "⚪" },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      priority === p.id
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{p.badge}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Title */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-foreground mb-1">
              <span>Notification Title <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-muted-foreground font-mono">{title.length}/100</span>
            </div>
            <Input
              placeholder="e.g. 🎉 Business Verification Approved: Abyssinia Gourmet Cafe"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          {/* Message Body */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-foreground mb-1">
              <span>Message Body Content <span className="text-red-500">*</span></span>
              <span className="text-[10px] text-muted-foreground font-mono">{body.length}/500</span>
            </div>
            <Textarea
              placeholder="Provide complete notification details, announcements, or actionable steps for the recipient..."
              value={body}
              maxLength={500}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Sender & Action Link Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Sender Attribution
              </label>
              <Input
                placeholder="e.g. Alex Rivera (Super Admin)"
                value={sentBy}
                onChange={(e) => setSentBy(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Action Link / Deep URL (Optional)
              </label>
              <Input
                placeholder="e.g. /dashboard or /business/slug"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Live Delivery Preview Card */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Live Recipient Preview</span>
              <Badge variant="outline" className="text-[9px] capitalize border-border">
                {target} Target
              </Badge>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-bold text-xs text-foreground">
                    {title.trim() || "Notification Title Appears Here"}
                  </span>
                </div>
                <Badge
                  className={`text-[9px] uppercase font-black ${
                    priority === "critical"
                      ? "bg-red-500/15 text-red-600 border-red-500/30"
                      : priority === "high"
                      ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                      : priority === "medium"
                      ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {priority}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {body.trim() || "Your message body content will appear here across recipient feeds and header dropdowns."}
              </p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                <span>By {sentBy || "Platform Administration"}</span>
                <span>Just now</span>
              </div>
            </div>
          </div>

          {/* Modal Action Controls */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-bold h-9 px-5 gap-2 shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Dispatching to MongoDB...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Register & Dispatch Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
