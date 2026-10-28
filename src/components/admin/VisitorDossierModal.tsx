"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Building2,
  MapPin,
  Calendar,
  Users,
  Shield,
  Crown,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Trash2,
  Copy,
  Send,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { GlobalUserSession, GlobalVisitorStatus, EscalationTarget } from "@/types/globalVisitors";

interface VisitorDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: GlobalUserSession | null;
  onUpdate: (updatedVisitor: GlobalUserSession) => void;
  onDelete: (visitorId: string) => void;
  currentRole?: string;
}

export function VisitorDossierModal({
  isOpen,
  onClose,
  visitor,
  onUpdate,
  onDelete,
  currentRole = "super_admin",
}: VisitorDossierModalProps) {
  const [status, setStatus] = useState<GlobalVisitorStatus>("active");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  useEffect(() => {
    if (visitor) {
      setStatus(visitor.status);
      setNotes(visitor.notes || "");
      setIsConfirmDelete(false);
    }
  }, [visitor]);

  if (!visitor) return null;

  // Handle in-modal status update
  const handleStatusChange = async (newStatus: GlobalVisitorStatus) => {
    setStatus(newStatus);
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/global-visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitor.id,
          actionType: "update_status",
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Visitor status updated to '${newStatus}'`);
        onUpdate({ ...visitor, status: newStatus });
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle saving notes
  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/global-visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitor.id,
          actionType: "update_details",
          updates: { notes },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Visitor notes updated successfully");
        onUpdate({ ...visitor, notes });
      } else {
        toast.error(data.error || "Failed to update notes");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update notes");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Escalation
  const handleEscalate = async (targetLevel: EscalationTarget) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/global-visitors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitor.id,
          actionType: "escalate",
          targetLevel,
          notes: `Escalated from dossier review to ${targetLevel.replace("_", " ")}`,
          adminName: currentRole.toUpperCase(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Escalated to ${targetLevel === "super_admin" ? "Super Admin" : "Country Admin"}`);
        onUpdate({
          ...visitor,
          escalatedTo: targetLevel,
          escalationNotes: `Escalated to ${targetLevel.replace("_", " ")}`,
        });
      } else {
        toast.error(data.error || "Failed to escalate");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to escalate");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/global-visitors?visitorId=${visitor.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Visitor record deleted successfully");
        onDelete(visitor.id);
        onClose();
      } else {
        toast.error(data.error || "Failed to delete record");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy dossier JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(visitor, null, 2));
    toast.success("Full visitor telemetry copied to clipboard as JSON!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 bg-card border border-border shadow-2xl rounded-3xl">
        <DialogTitle className="sr-only">Visitor Intelligence Dossier</DialogTitle>
        <DialogDescription className="sr-only">
          Detailed telemetry, contact information, and governance controls for global visitor {visitor.id}
        </DialogDescription>

        {/* ── Top Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white border border-border shadow-lg">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl shrink-0">{visitor.visitorFlag}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {visitor.visitorName || "International Visitor"}
                  </h3>
                  {visitor.visitorType === "future" ? (
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-xs font-bold">
                      Upcoming Delegation
                    </Badge>
                  ) : (
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs font-bold">
                      Live Telemetry
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-slate-300 border-white/20 text-[10px] font-mono">
                    {visitor.id}
                  </Badge>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Origin: {visitor.visitorCity}, {visitor.visitorCountry} ({visitor.visitorCountryCode})
                  </span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{visitor.relativeTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl text-xs font-bold gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON
              </Button>
            </div>
          </div>
        </div>

        {/* ── Direct Contact & Action Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {visitor.contactEmail ? (
            <a
              href={`mailto:${visitor.contactEmail}`}
              className="p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-all flex items-center gap-2.5 text-xs text-foreground font-bold"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-muted-foreground font-medium">Email Visitor</span>
                <span className="truncate">{visitor.contactEmail}</span>
              </div>
            </a>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              <span>No direct email provided</span>
            </div>
          )}

          {visitor.contactPhone ? (
            <a
              href={`tel:${visitor.contactPhone}`}
              className="p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-all flex items-center gap-2.5 text-xs text-foreground font-bold"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-muted-foreground font-medium">Direct Phone / Call</span>
                <span className="truncate">{visitor.contactPhone}</span>
              </div>
            </a>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>No direct phone provided</span>
            </div>
          )}

          {visitor.contactPhone ? (
            <a
              href={`https://wa.me/${visitor.contactPhone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-all flex items-center gap-2.5 text-xs text-foreground font-bold"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-muted-foreground font-medium">WhatsApp Chat</span>
                <span className="truncate">Message on WhatsApp</span>
              </div>
            </a>
          ) : (
            <div className="p-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp unavailable</span>
            </div>
          )}
        </div>

        {/* ── 2 Columns: Commercial Intent & Network Telemetry ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Commercial & Platform Engagement */}
          <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              Commercial Profile & Engagement
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Target Business:</span>
                <strong className="text-foreground">{visitor.targetBusinessName}</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Host Jurisdiction:</span>
                <strong className="text-foreground">
                  {visitor.targetBusinessCity}, {visitor.targetBusinessCountry}
                </strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Action Type:</span>
                <Badge variant="outline" className="font-bold text-[10px] uppercase">
                  {visitor.action}
                </Badge>
              </div>

              <div className="p-2 rounded-xl bg-card border border-border">
                <span className="block text-muted-foreground text-[10px] mb-0.5">Commercial Purpose:</span>
                <p className="text-foreground font-semibold leading-relaxed">{visitor.purpose}</p>
              </div>

              {visitor.visitorType === "future" && (
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                  <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-300 font-bold">
                    <span>Delegation Size:</span>
                    <span>{visitor.delegationSize || 1} Delegates</span>
                  </div>
                  {visitor.scheduledDate && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Scheduled Arrival:</span>
                      <span>{new Date(visitor.scheduledDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* In-Place Status Update */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-[11px] font-bold text-foreground">Update Session Status</label>
              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as GlobalVisitorStatus)}
                  disabled={isUpdating}
                  className="flex-1 h-9 px-3 rounded-xl border border-border bg-card text-xs font-bold"
                >
                  <option value="active">Active Live Session</option>
                  <option value="completed">Completed / Handled</option>
                  <option value="scheduled">Scheduled Delegation</option>
                  <option value="confirmed">Confirmed Inbound</option>
                  <option value="in_transit">In Transit / Traveling</option>
                  <option value="arrived">Arrived at Destination</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: Technical Telemetry & Audit */}
          <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <h4 className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-cyan-500" />
              Technical Telemetry & Network Audit
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Device / Browser:</span>
                <strong className="text-foreground truncate max-w-[170px]" title={visitor.visitorDevice}>
                  {visitor.visitorDevice}
                </strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-mono font-bold text-foreground">{visitor.visitorIp}</span>
              </div>

              <div className="p-2 rounded-xl bg-card border border-border">
                <span className="block text-muted-foreground text-[10px] mb-0.5">Referrer Source:</span>
                <span className="font-semibold text-foreground text-xs">{visitor.referrer}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Registered By:</span>
                <strong className="text-primary">{visitor.registeredBy}</strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Governance Tier:</span>
                <Badge variant="outline" className="capitalize text-[10px] font-bold">
                  {visitor.jurisdictionLevel} scope
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border">
                <span className="text-muted-foreground">Escalation Status:</span>
                {visitor.escalatedTo === "super_admin" ? (
                  <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold">
                    Super Admin
                  </Badge>
                ) : visitor.escalatedTo === "country_admin" ? (
                  <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                    Country Admin
                  </Badge>
                ) : (
                  <span className="text-muted-foreground font-medium">Standard / City Scope</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Special Notes & Administrative Insights ── */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-foreground">Administrative Notes & Follow-Up</label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveNotes}
              disabled={isUpdating}
              className="h-7 text-xs font-bold rounded-lg"
            >
              Save Notes
            </Button>
          </div>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add briefing notes, bilateral agreements, or municipal meeting outcomes..."
            className="w-full p-2.5 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* ── Multi-Tier Escalation Bar ── */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              Administrative Governance Escalation
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Escalate high-stake leads directly to National or Global headquarters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {visitor.escalatedTo !== "country_admin" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEscalate("country_admin")}
                disabled={isUpdating}
                className="text-xs font-bold rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                ➔ Country Admin
              </Button>
            )}

            {visitor.escalatedTo !== "super_admin" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEscalate("super_admin")}
                disabled={isUpdating}
                className="text-xs font-bold rounded-xl border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              >
                ➔ Super Admin
              </Button>
            )}
          </div>
        </div>

        {/* ── Bottom Footer with Delete & Close ── */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
          {isConfirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Confirm delete?
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 text-xs font-bold rounded-xl"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Record"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsConfirmDelete(false)}
                className="h-8 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsConfirmDelete(true)}
              className="text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Record
            </Button>
          )}

          <Button
            type="button"
            onClick={onClose}
            className="text-xs font-black rounded-xl px-5"
          >
            Close Dossier
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
