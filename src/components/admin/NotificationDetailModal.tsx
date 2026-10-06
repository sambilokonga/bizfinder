"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Building2,
  Users,
  Shield,
  Trash2,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { INotification } from "@/types/notification";
import { toast } from "sonner";
import Link from "next/link";

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: INotification | null;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onNavigate?: (link: string) => void;
}

export function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
  onDelete,
  onMarkRead,
  onMarkUnread,
  onNavigate,
}: NotificationDetailModalProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  // Auto-mark as read when opened if unread
  React.useEffect(() => {
    if (isOpen && notification && !notification.isRead && onMarkRead) {
      onMarkRead(notification.id);
    }
  }, [isOpen, notification, onMarkRead]);

  if (!notification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${notification.title}\n\n${notification.body}`
    );
    setHasCopied(true);
    toast.success("Notification content copied to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case "business":
        return <Building2 className="w-4 h-4 text-emerald-500" />;
      case "user":
        return <Users className="w-4 h-4 text-purple-500" />;
      case "admin":
        return <Shield className="w-4 h-4 text-rose-500" />;
      default:
        return <Globe className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 rounded-3xl border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/20 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {notification.id}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] capitalize font-bold flex items-center gap-1 border-border"
              >
                {getTargetIcon(notification.target)}
                {notification.target} Scope
              </Badge>
            </div>

            <Badge
              className={`text-[10px] uppercase font-black ${
                notification.priority === "critical"
                  ? "bg-red-500/15 text-red-600 border-red-500/30 animate-pulse"
                  : notification.priority === "high"
                  ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                  : notification.priority === "medium"
                  ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {notification.priority || "Medium"} Priority
            </Badge>
          </div>

          <DialogTitle className="text-lg font-black text-foreground leading-snug">
            {notification.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Dispatched {notification.sent || "Recently"} • By{" "}
              <strong className="text-foreground">{notification.sentBy || "Platform"}</strong>
            </span>
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
            {notification.body}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Delivery Status
              </span>
              <span className="font-bold text-emerald-600 mt-0.5 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {notification.status || "Delivered"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Category
              </span>
              <span className="font-bold text-foreground capitalize mt-0.5 block">
                {notification.type || "System Alert"}
              </span>
            </div>
          </div>

          {/* Optional Action Link */}
          {notification.link && (
            <div className="pt-1">
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate(notification.link!);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-xs font-bold text-primary transition-colors cursor-pointer"
                >
                  <span>Follow Notification Link ({notification.link})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={notification.link}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-xl bg-primary/10 hover:bg-primary/15 border border-primary/20 text-xs font-bold text-primary transition-colors"
                >
                  <span>Follow Notification Link ({notification.link})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs gap-1.5 h-8"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {hasCopied ? "Copied" : "Copy"}
            </Button>
            {onMarkUnread && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onMarkUnread(notification.id);
                  onClose();
                }}
                className="text-xs gap-1.5 h-8 text-amber-600 hover:text-amber-700"
              >
                Mark as Unread
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
                className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold h-8 px-4"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
