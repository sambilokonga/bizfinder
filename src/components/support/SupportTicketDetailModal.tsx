"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Ticket,
  User,
  Building2,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Tag,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Check,
  Copy,
  FileText,
  CheckCheck,
} from "lucide-react";
import { ISupportTicket, TicketPriority, TicketStatus } from "@/types/ticket";
import { toast } from "sonner";
import {
  playNotificationSound,
  showDesktopNotification,
} from "@/hooks/useNotifications";

interface SupportTicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ISupportTicket | null;
  currentUserName?: string;
  currentUserRole?: "user" | "owner" | "admin" | "super_admin";
  onTicketUpdated?: (updated: ISupportTicket) => void;
  onTicketDeleted?: (ticketId: string) => void;
}

const QUICK_MACROS = [
  "📄 I have attached and provided the requested trade license/certificate.",
  "💳 Transaction reference verified. Settlement details confirmed on our end.",
  "⚡ Requesting expedited SLA review for this branch operational issue.",
  "✅ Verified and working properly now. Thank you for your assistance!",
];

export function SupportTicketDetailModal({
  isOpen,
  onClose,
  ticket,
  currentUserName = "Platform Support",
  currentUserRole = "admin",
  onTicketUpdated,
  onTicketDeleted,
}: SupportTicketDetailModalProps) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdminRole = currentUserRole === "admin" || currentUserRole === "super_admin";

  useEffect(() => {
    if (isOpen && ticket?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, ticket?.messages?.length]);

  if (!ticket) return null;

  const handleCopyTranscript = () => {
    const text = `Support Ticket #${ticket.id} - ${ticket.subject}\nCategory: ${ticket.category} | Priority: ${ticket.priority} | Status: ${ticket.status}\nCustomer: ${ticket.userName} (${ticket.businessName || "Merchant"})\n\n--- Conversation Transcript ---\n${ticket.messages
      .map(
        (m) =>
          `[${new Date(m.createdAt).toLocaleString()}] ${m.senderName} (${m.senderRole}):\n${m.message}`
      )
      .join("\n\n")}`;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success("Ticket transcript copied to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleSimulateStaffReply = async (scenario: "approve" | "clarify" | "solution") => {
    setIsSimulating(true);
    try {
      let staffName =
        ticket.assignedAdmin && ticket.assignedAdmin !== "Unassigned"
          ? ticket.assignedAdmin
          : "Admin Elena (Compliance Desk)";
      let message = "";
      let newStatus: TicketStatus = "in_progress";

      if (scenario === "approve") {
        staffName = "Compliance Department";
        message = `Hello ${ticket.userName || "Merchant"}! We have verified your business registration credentials. Your verified badge is now activated on your public listing.`;
        newStatus = "resolved";
      } else if (scenario === "clarify") {
        staffName = "Support Operations";
        message = `Good day! To help us resolve this promptly, could you please upload or confirm the transaction receipt number and your registered branch phone?`;
        newStatus = "waiting_on_customer";
      } else {
        staffName = "Technical Support Lead";
        message = `We have deployed an operational adjustment on the platform switch. Everything is now synchronized. Please check your dashboard to confirm resolution.`;
        newStatus = "resolved";
      }

      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: staffName,
          senderRole: "admin",
          message,
          newStatus,
        }),
      });

      const data = await res.json();
      if (data?.success && data.ticket) {
        playNotificationSound();
        showDesktopNotification(
          `🎫 Support Update #${ticket.id}`,
          `${staffName}: "${message.slice(0, 80)}..."`
        );
        toast.success(`Staff reply simulated from ${staffName}!`);
        if (onTicketUpdated) onTicketUpdated(data.ticket);
      } else {
        toast.error(data?.error || "Failed to simulate staff response");
      }
    } catch (err: any) {
      toast.error("Network error simulating reply");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendReply = async (newStatus?: TicketStatus) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultStatus = isAdminRole
        ? "in_progress"
        : ticket.status === "waiting_on_customer"
        ? "in_progress"
        : undefined;

      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: currentUserName,
          senderRole: currentUserRole,
          message: replyText.trim(),
          newStatus: newStatus || defaultStatus,
        }),
      });

      const data = await res.json();
      if (data?.success && data.ticket) {
        toast.success(newStatus === "resolved" ? "Reply sent & ticket resolved!" : "Reply submitted successfully.");
        setReplyText("");
        if (onTicketUpdated) onTicketUpdated(data.ticket);
      } else {
        toast.error(data?.error || "Failed to submit reply");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error submitting reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: TicketStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data?.success && data.ticket) {
        toast.success(`Ticket status marked as ${status.replace(/_/g, " ")}`);
        if (onTicketUpdated) onTicketUpdated(data.ticket);
      } else {
        toast.error(data?.error || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePriority = async (priority: TicketPriority) => {
    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });

      const data = await res.json();
      if (data?.success && data.ticket) {
        toast.success(`Priority updated to ${priority}`);
        if (onTicketUpdated) onTicketUpdated(data.ticket);
      }
    } catch (err: any) {
      toast.error("Failed to update priority");
    }
  };

  const handleUpdateAssignee = async (assignedAdmin: string) => {
    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedAdmin }),
      });

      const data = await res.json();
      if (data?.success && data.ticket) {
        toast.success(`Assigned to ${assignedAdmin}`);
        if (onTicketUpdated) onTicketUpdated(data.ticket);
      }
    } catch (err: any) {
      toast.error("Failed to update assignee");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.id}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/support/tickets/${encodeURIComponent(ticket.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        toast.success(`Ticket ${ticket.id} deleted.`);
        if (onTicketDeleted) onTicketDeleted(ticket.id);
        onClose();
      } else {
        toast.error(data?.error || "Failed to delete ticket");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete ticket");
    }
  };

  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-xs font-bold">
            🔴 Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-xs font-bold">
            ⚡ In Progress
          </Badge>
        );
      case "waiting_on_customer":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs font-bold">
            ⏳ Waiting on Customer
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-bold">
            ✓ Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 text-xs font-bold">
            🔒 Closed
          </Badge>
        );
    }
  };

  const renderPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "critical":
        return (
          <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-black animate-pulse">
            🚨 Critical SLA
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/30 text-[10px] font-bold">
            🔥 High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[10px] font-bold">
            🔵 Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            ⚪ Low
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl border-border bg-card">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20">
                {ticket.id}
              </span>
              {renderStatusBadge(ticket.status)}
              {renderPriorityBadge(ticket.priority)}
              <Badge variant="outline" className="capitalize text-[10px] font-bold">
                {ticket.category}
              </Badge>
            </div>
            <DialogTitle className="text-lg sm:text-xl font-black text-foreground mt-2 tracking-tight">
              {ticket.subject}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Opened on {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy Transcript */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyTranscript}
              className="h-8 text-xs font-bold gap-1 text-muted-foreground"
              title="Copy entire ticket conversation transcript"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{hasCopied ? "Copied" : "Copy Transcript"}</span>
            </Button>

            {/* Admin Delete */}
            {isAdminRole && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            )}

            {/* Status-specific action buttons */}
            {ticket.status === "resolved" ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("open")}
                  disabled={isUpdatingStatus}
                  className="h-8 text-xs font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("closed")}
                  disabled={isUpdatingStatus}
                  className="h-8 text-xs font-bold text-slate-700 dark:text-slate-300 border-border hover:bg-muted gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Confirm &amp; Close
                </Button>
              </>
            ) : ticket.status === "closed" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus("open")}
                disabled={isUpdatingStatus}
                className="h-8 text-xs font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reopen Ticket
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus("resolved")}
                  disabled={isUpdatingStatus}
                  className="h-8 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUpdateStatus("closed")}
                  disabled={isUpdatingStatus}
                  className="h-8 text-xs font-semibold text-muted-foreground hover:text-red-500 gap-1"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content Body: Left Column Chat Timeline, Right Column Ticket Metadata */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/80">
          {/* Main Chat Conversation Thread */}
          <div className="lg:col-span-2 p-5 sm:p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Ticket Conversation Thread ({ticket.messages.length} message{ticket.messages.length === 1 ? "" : "s"})
              </div>

              {ticket.messages.map((msg, idx) => {
                const isStaff = msg.senderRole === "admin" || msg.senderRole === "super_admin";
                return (
                  <div
                    key={msg.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isStaff
                        ? "bg-primary/5 border-primary/20 ml-2"
                        : "bg-background border-border/80 mr-2"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isStaff
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {msg.senderName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            {msg.senderName}
                            <Badge
                              className={`text-[9px] font-bold ${
                                isStaff
                                  ? "bg-primary/20 text-primary border-primary/30"
                                  : msg.senderRole === "owner"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {isStaff
                                ? "🛡️ Support Staff"
                                : msg.senderRole === "owner"
                                ? "🏢 Business Owner"
                                : "👤 Customer"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap pl-9">
                      {msg.message}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Composer Box */}
            <div className="pt-4 border-t border-border/80 space-y-3">
              {/* Quick Response Macros */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick Response Templates:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_MACROS.map((macro, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(macro)}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70 transition-colors text-left"
                    >
                      {macro}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isAdminRole
                    ? "Write an administrative response or diagnostic update for the customer..."
                    : "Add an update or provide requested details to platform support..."
                }
                rows={3}
                className="text-xs rounded-2xl resize-none"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span>Responding as:</span>
                  <strong className="text-foreground">{currentUserName}</strong>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* ⚡ Live Staff Simulation Assistant */}
                  <div className="relative inline-block">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSimulateStaffReply(e.target.value as any);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                      disabled={isSimulating}
                      className="h-8 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-2 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
                    >
                      <option value="" disabled>⚡ Simulate Staff Response…</option>
                      <option value="approve">✅ 1. License Verification Approved</option>
                      <option value="clarify">⏳ 2. Request Transaction Receipt</option>
                      <option value="solution">🛠️ 3. Technical Patch Solution</option>
                    </select>
                  </div>

                  {isAdminRole && ticket.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSubmitting || !replyText.trim()}
                      onClick={() => handleSendReply("resolved")}
                      className="text-xs font-bold h-8 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      Reply & Resolve
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="gradient"
                    disabled={isSubmitting || !replyText.trim()}
                    onClick={() => handleSendReply()}
                    className="text-xs font-bold h-8 gap-1.5 shadow-md shadow-primary/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Case File & Context Details */}
          <div className="p-5 sm:p-6 space-y-6 bg-muted/10 text-xs">
            {/* Requester Profile */}
            <div className="space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Customer Information
              </div>

              <div className="p-3.5 rounded-2xl bg-background border border-border/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>{ticket.userName}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{ticket.userEmail}</span>
                </div>
                {ticket.userPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{ticket.userPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {ticket.city || "Addis Ababa"}, {ticket.country || "Ethiopia"}
                  </span>
                </div>
              </div>
            </div>

            {/* Business Context */}
            {ticket.businessName && (
              <div className="space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Business Entity
                </div>

                <div className="p-3.5 rounded-2xl bg-background border border-border/80 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>{ticket.businessName}</span>
                  </div>
                  {ticket.businessId && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      ID: {ticket.businessId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ticket Controls (Admin only controls) */}
            {isAdminRole && (
              <div className="space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Administrative Workflow
                </div>

                <div className="space-y-2.5 p-3.5 rounded-2xl bg-background border border-border/80">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      Ticket Status
                    </label>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleUpdateStatus(e.target.value as TicketStatus)}
                      className="w-full bg-card text-foreground text-xs font-bold py-1.5 px-2.5 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="open">🔴 Open</option>
                      <option value="in_progress">⚡ In Progress</option>
                      <option value="waiting_on_customer">⏳ Waiting on Customer</option>
                      <option value="resolved">✓ Resolved</option>
                      <option value="closed">🔒 Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      Priority Level
                    </label>
                    <select
                      value={ticket.priority}
                      onChange={(e) => handleUpdatePriority(e.target.value as TicketPriority)}
                      className="w-full bg-card text-foreground text-xs font-bold py-1.5 px-2.5 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="critical">🚨 Critical SLA</option>
                      <option value="high">🔥 High</option>
                      <option value="medium">🔵 Medium</option>
                      <option value="low">⚪ Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      Assigned Administrator
                    </label>
                    <select
                      value={ticket.assignedAdmin || "Unassigned"}
                      onChange={(e) => handleUpdateAssignee(e.target.value)}
                      className="w-full bg-card text-foreground text-xs font-bold py-1.5 px-2.5 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Admin Elena">Admin Elena</option>
                      <option value="Admin Marcus">Admin Marcus</option>
                      <option value="Alex Rivera (Super Admin)">Alex Rivera (Super Admin)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tags & Metadata */}
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                  Indexed Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono font-semibold text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
