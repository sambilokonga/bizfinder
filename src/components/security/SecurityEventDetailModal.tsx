"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Globe,
  Server,
  Smartphone,
  CheckCircle2,
  XCircle,
  Copy,
  Terminal,
  ExternalLink,
  Ban,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ISecurityEvent } from "@/types/security";

interface SecurityEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ISecurityEvent | null;
  onStatusUpdated?: (updatedEvent: ISecurityEvent) => void;
  onIpBlocked?: (ip: string) => void;
  currentAdminName?: string;
}

export function SecurityEventDetailModal({
  isOpen,
  onClose,
  event,
  onStatusUpdated,
  onIpBlocked,
  currentAdminName = "Alex Rivera (Super Admin)",
}: SecurityEventDetailModalProps) {
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (!event) return null;

  const handleUpdateStatus = async (
    newStatus: ISecurityEvent["status"],
    actionTaken?: ISecurityEvent["actionTaken"],
    resolutionNotes?: string
  ) => {
    setIsActionLoading(true);
    try {
      const res = await fetch("/api/security/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: event.id,
          status: newStatus,
          actionTaken: actionTaken || event.actionTaken,
          resolutionNotes: resolutionNotes || `Mitigated by ${currentAdminName}`,
          resolvedBy: currentAdminName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.event) {
        toast.success(`Security event status updated to "${newStatus}"!`);
        if (onStatusUpdated) onStatusUpdated(data.event);
        onClose();
      } else {
        toast.error(data.error || "Failed to update event status.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating event status.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBlockIp = async () => {
    if (!window.confirm(`Are you sure you want to permanently block IP address ${event.ipAddress} across the platform?`)) {
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await fetch("/api/security/block-ip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: event.ipAddress,
          reason: `Associated with incident: ${event.title}`,
          blockedBy: currentAdminName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`IP address ${event.ipAddress} has been added to firewall ban rules!`);
        if (onIpBlocked) onIpBlocked(event.ipAddress);
        handleUpdateStatus("blocked", "blocked", `IP ${event.ipAddress} banned in firewall.`);
      } else {
        toast.error(data.error || "Failed to block IP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error blocking IP.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-bold">🔴 Critical Threat</Badge>;
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/30 text-[10px] font-bold">🟠 High Severity</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold">🟡 Medium Risk</Badge>;
      case "low":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/30 text-[10px] font-bold">🔵 Low Risk</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">ℹ️ Informational</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-card border border-border shadow-2xl">
        <DialogTitle className="sr-only">Security Incident Dossier</DialogTitle>
        <DialogDescription className="sr-only">Detailed forensic metadata for the security event</DialogDescription>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {getSeverityBadge(event.severity)}
              <span className="font-mono text-xs text-muted-foreground">{event.id}</span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">
                {event.eventType}
              </span>
            </div>
            <h3 className="text-lg font-black text-foreground mt-1.5">{event.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Detected on {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 pt-2 text-xs">
          {/* Description Card */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1.5">
            <div className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
              Forensic Incident Summary
            </div>
            <p className="text-foreground leading-relaxed text-xs">{event.description}</p>
          </div>

          {/* Core Technical Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Origin IP Address</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-bold text-foreground text-xs">{event.ipAddress}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(event.ipAddress);
                    toast.success("IP copied!");
                  }}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Origin Location</span>
              <span className="font-bold text-foreground text-xs mt-1 block truncate">
                {event.city || "Unknown"}, {event.country || "Global"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Target Endpoint</span>
              <span className="font-mono font-bold text-foreground text-xs mt-1 block truncate">
                {event.targetResource || "/admin"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Actor / Entity</span>
              <span className="font-bold text-foreground text-xs mt-1 block truncate">
                {event.actorName}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize block">{event.actorRole}</span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Client Fingerprint</span>
              <span className="font-bold text-foreground text-xs mt-1 block truncate">
                {event.device || "Desktop"} • {event.browser || "Chrome"}
              </span>
              <span className="text-[10px] text-muted-foreground block">{event.os || "Linux"}</span>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border">
              <span className="text-[10px] text-muted-foreground block font-semibold">Action Enforced</span>
              <span className="font-bold text-foreground capitalize text-xs mt-1 block">
                {event.actionTaken}
              </span>
            </div>
          </div>

          {/* Raw Metadata JSON Drawer */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1 font-bold"><Terminal className="w-3 h-3 text-emerald-400" /> RAW METADATA PAYLOAD</span>
              </div>
              <pre className="overflow-x-auto text-[10px] text-emerald-400 pt-1">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Resolution status if resolved */}
          {event.resolvedBy && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold">Mitigated by {event.resolvedBy}</span>
                {event.resolutionNotes && <p className="text-[11px] mt-0.5">{event.resolutionNotes}</p>}
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            </div>
          )}
        </div>

        {/* Action Mitigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border mt-4">
          <Button
            size="sm"
            variant="destructive"
            onClick={handleBlockIp}
            disabled={isActionLoading}
            className="text-xs font-bold gap-1.5"
          >
            <Ban className="w-3.5 h-3.5" /> Block IP ({event.ipAddress})
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            {event.status !== "resolved" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus("dismissed", "allowed", "Dismissed as false positive.")}
                disabled={isActionLoading}
                className="text-xs"
              >
                Dismiss
              </Button>
            )}

            {event.status !== "resolved" && (
              <Button
                size="sm"
                variant="gradient"
                onClick={() => handleUpdateStatus("resolved", "blocked", `Resolved by ${currentAdminName}`)}
                disabled={isActionLoading}
                className="text-xs font-bold gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
              </Button>
            )}

            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
