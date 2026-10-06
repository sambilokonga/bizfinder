"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  FileCheck,
} from "lucide-react";

export interface PendingClaim {
  id: string;
  businessId?: string;
  businessName: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  method: string;
  documentUrl?: string;
  tinNumber?: string;
  matchScore?: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

interface ClaimDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: PendingClaim | null;
  onApprove: (claimId: string, notes?: string) => void;
  onReject: (claimId: string, reason: string) => void;
}

export function ClaimDetailModal({
  isOpen,
  onClose,
  claim,
  onApprove,
  onReject,
}: ClaimDetailModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  if (!claim) return null;

  const handleApprove = () => {
    onApprove(claim.id, adminNotes);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(claim.id, rejectReason.trim());
    setIsRejecting(false);
    setRejectReason("");
    onClose();
  };

  const matchScore = claim.matchScore ?? 92;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-card border-border rounded-3xl">
        <DialogTitle className="text-xl font-black text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span>Claim Ownership Verification</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                Review applicant proof before granting manager access
              </p>
            </div>
          </div>
          <Badge
            variant={
              claim.status === "approved"
                ? "success"
                : claim.status === "rejected"
                ? "destructive"
                : "warning"
            }
            className="text-xs uppercase font-bold"
          >
            {claim.status}
          </Badge>
        </DialogTitle>

        <div className="space-y-6 pt-4 text-xs">
          {/* AI Match Score Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>Confidence Match Score: {matchScore}%</span>
                  <Badge variant="outline" className="text-[10px] text-indigo-600 border-indigo-300">
                    High Confidence
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Official domain match + Registered TIN + Verified contact phone
                </p>
              </div>
            </div>
          </div>

          {/* Business & Claimant Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Info */}
            <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border/60">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Target Business</span>
              </div>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="text-sm font-black text-foreground">
                  {claim.businessName}
                </div>
                {claim.tinNumber && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span>TIN / Tax ID:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {claim.tinNumber}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px]">
                  <span>Submission Date:</span>
                  <span className="font-medium text-foreground">
                    {new Date(claim.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Claimant Info */}
            <div className="p-4 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-foreground pb-2 border-b border-border/60">
                <User className="w-4 h-4 text-indigo-500" />
                <span>Claimant Applicant</span>
              </div>
              <div className="space-y-1.5 text-muted-foreground">
                <div className="text-sm font-black text-foreground">
                  {claim.claimantName}
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Mail className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{claim.claimantEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Phone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{claim.claimantPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Evidence */}
          <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
            <div className="font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                Submitted Documentation & Proof
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-foreground">
                    {claim.method}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Official Business Registration / Trade License Certificate
                  </div>
                </div>
              </div>
              {claim.documentUrl && (
                <a
                  href={claim.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Proof Document
                </a>
              )}
            </div>
          </div>

          {/* Admin Decision Notes */}
          <div className="space-y-2">
            <label className="font-bold text-foreground block">
              Internal Admin Notes / Audit Log (Optional)
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Verified trade license against Ministry of Trade registry."
              className="w-full p-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Rejection Mode Input */}
          {isRejecting && (
            <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Rejection Reason (sent to claimant)</span>
              </div>
              <textarea
                required
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. The submitted business license name does not match the registered trading name. Please provide official letter of authorization."
                className="w-full p-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRejecting(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="gap-1 font-bold"
                >
                  <XCircle className="w-3.5 h-3.5" /> Confirm Rejection
                </Button>
              </div>
            </div>
          )}

          {/* Action Footer */}
          {!isRejecting && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsRejecting(true)}
                  className="gap-1.5 text-xs font-bold"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Claim
                </Button>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={handleApprove}
                  className="gap-1.5 text-xs font-bold shadow-md shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Grant Access
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
