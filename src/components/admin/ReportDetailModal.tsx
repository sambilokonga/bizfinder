"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Flag,
  Building2,
  Star,
  Users,
  Camera,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Ban,
  Clock,
  MapPin,
  Calendar,
  UserCheck,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { IReport, ReportStatus, ReportActionTaken } from "@/types/report";

interface ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: IReport | null;
  onStatusUpdated: (updated: IReport) => void;
  currentAdminName?: string;
}

export function ReportDetailModal({
  isOpen,
  onClose,
  report,
  onStatusUpdated,
  currentAdminName = "Alex Rivera (Super Admin)",
}: ReportDetailModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!report) return null;

  const handleAction = async (
    targetStatus: ReportStatus,
    actionTaken: ReportActionTaken,
    defaultNote: string
  ) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          actionTaken,
          resolutionNotes: resolutionNotes.trim() || defaultNote,
          resolvedBy: currentAdminName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update incident status");
      }

      toast.success(data.message || `Incident ${report.id} updated to ${targetStatus}!`);
      onStatusUpdated(data.data);
      onClose();
      setResolutionNotes("");
    } catch (err: any) {
      console.error("Moderation action error:", err);
      toast.error(err.message || "Failed to update report status");
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "critical":
        return <Badge className="bg-red-500/15 text-red-600 border-red-500/30 font-bold text-[10px] animate-pulse">🔴 Critical</Badge>;
      case "high":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold text-[10px]">🟠 High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 font-bold text-[10px]">🔵 Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] text-muted-foreground">⚪ Low</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "resolved":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold text-[10px]">✓ Resolved</Badge>;
      case "investigating":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 font-bold text-[10px]">🔍 Investigating</Badge>;
      case "under_review":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold text-[10px]">⏳ Under Review</Badge>;
      case "dismissed":
        return <Badge variant="outline" className="text-muted-foreground border-border text-[10px]">✕ Dismissed</Badge>;
      default:
        return <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/30 font-bold text-[10px]">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl bg-card border border-border shadow-2xl">
        {/* Dossier Top Banner */}
        <div className="p-6 bg-gradient-to-r from-red-500/10 via-card to-transparent border-b border-border/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-black">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground">{report.id}</span>
                {getPriorityBadge(report.priority)}
                {getStatusBadge(report.status)}
              </div>
              <DialogTitle className="text-lg font-black text-foreground mt-0.5">
                {report.title}
              </DialogTitle>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Incident Fact Sheet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Entity</div>
              <div className="text-sm font-black text-foreground truncate">{report.targetName}</div>
              <div className="text-[11px] text-muted-foreground font-mono">ID: {report.targetId} • Type: {report.type}</div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reporter Details</div>
              <div className="text-sm font-bold text-foreground">{report.reporterName}</div>
              <div className="text-[11px] text-muted-foreground truncate">{report.reporterEmail || "Anonymous / Internal"} • Role: {report.reporterRole}</div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Jurisdiction & Date</div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {report.city || "Addis Ababa"}, {report.country || "Ethiopia"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {new Date(report.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Primary Reason & Evidence Body */}
          <div className="p-5 rounded-2xl bg-card border border-border/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Violation Reason</div>
              <Badge variant="outline" className="text-xs font-bold text-primary border-primary/30">
                {report.reason}
              </Badge>
            </div>

            {report.details && (
              <div className="space-y-1 pt-2 border-t border-border/60">
                <div className="text-xs font-bold text-foreground">Incident Description / Facts:</div>
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl">
                  {report.details}
                </p>
              </div>
            )}

            {/* Evidence Image / Links */}
            {report.evidenceUrls && report.evidenceUrls.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="text-xs font-bold text-foreground">Attached Evidence Assets:</div>
                <div className="flex flex-wrap gap-3">
                  {report.evidenceUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-border max-w-xs block hover:ring-2 hover:ring-primary transition-all"
                    >
                      <img src={url} alt="Evidence" className="h-28 w-auto object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-4 h-4" /> View Full Asset
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Audit History if already resolved */}
          {report.resolutionNotes && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Resolution Finding & Action Taken
              </div>
              <p className="text-xs text-foreground/90">{report.resolutionNotes}</p>
              <div className="text-[11px] text-muted-foreground">
                Action: <strong className="text-foreground">{report.actionTaken}</strong> • Resolved by: {report.resolvedBy || "Administrator"}
                {report.resolvedAt && ` on ${new Date(report.resolvedAt).toLocaleDateString()}`}
              </div>
            </div>
          )}

          {/* Moderation Notes Input */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Administrative Resolution Notes / Enforcement Finding
            </label>
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={2}
              placeholder="Add incident review notes before applying verdict or closing report..."
              className="text-xs rounded-xl resize-none"
            />
          </div>

          {/* Action Execution Palette */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
            <div className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Moderation Verdict & Enforcement Controls
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <Button
                size="sm"
                variant="outline"
                disabled={isProcessing}
                onClick={() =>
                  handleAction(
                    "investigating",
                    "none",
                    "Assigned to active investigative queue for compliance verification."
                  )
                }
                className="text-xs font-bold border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
              >
                <Clock className="w-3.5 h-3.5 mr-1" />
                Investigate
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={isProcessing}
                onClick={() =>
                  handleAction(
                    "resolved",
                    "penalty_applied",
                    "Violation confirmed. Account/Listing received strike penalty."
                  )
                }
                className="text-xs font-bold border-red-500/30 text-red-600 hover:bg-red-500/10"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Apply Penalty
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={isProcessing}
                onClick={() =>
                  handleAction(
                    "resolved",
                    "content_removed",
                    "Offending content permanently unlisted and purged."
                  )
                }
                className="text-xs font-bold border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Remove Content
              </Button>

              <Button
                size="sm"
                variant="ghost"
                disabled={isProcessing}
                onClick={() =>
                  handleAction(
                    "dismissed",
                    "dismissed",
                    "Report dismissed after review; no violation found."
                  )
                }
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Dismiss Report
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
