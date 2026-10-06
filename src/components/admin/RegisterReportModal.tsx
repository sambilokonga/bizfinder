"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Flag,
  Building2,
  Star,
  Users,
  Camera,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  MapPin,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { IReport, ReportPriority, ReportType } from "@/types/report";

interface RegisterReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportRegistered: (report: IReport) => void;
  businessesList?: Array<{ id: string; name: string }>;
  currentAdminName?: string;
  preselectedTargetType?: ReportType;
  preselectedTargetId?: string;
  preselectedTargetName?: string;
}

export function RegisterReportModal({
  isOpen,
  onClose,
  onReportRegistered,
  businessesList = [],
  currentAdminName = "Super Admin",
  preselectedTargetType = "business",
  preselectedTargetId,
  preselectedTargetName,
}: RegisterReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>(preselectedTargetType);
  const [targetName, setTargetName] = useState(preselectedTargetName || "");
  const [targetId, setTargetId] = useState(preselectedTargetId || "");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("Fraud / Unlicensed Financial Scam");
  const [priority, setPriority] = useState<ReportPriority>("high");
  const [details, setDetails] = useState("");
  const [reporterName, setReporterName] = useState(currentAdminName || "Alex Rivera (Super Admin)");
  const [reporterEmail, setReporterEmail] = useState("admin@bizfinder.et");
  const [city, setCity] = useState("Addis Ababa");
  const [country, setCountry] = useState("Ethiopia");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if preselected props change
  React.useEffect(() => {
    if (preselectedTargetType) setReportType(preselectedTargetType);
    if (preselectedTargetName) setTargetName(preselectedTargetName);
    if (preselectedTargetId) setTargetId(preselectedTargetId);
  }, [preselectedTargetType, preselectedTargetName, preselectedTargetId]);

  const TYPE_OPTIONS: Array<{
    type: ReportType;
    label: string;
    icon: React.ReactNode;
    color: string;
    desc: string;
  }> = [
    {
      type: "business",
      label: "Business Listing",
      icon: <Building2 className="w-4 h-4 text-indigo-500" />,
      color: "border-indigo-500/40 bg-indigo-500/5",
      desc: "Scams, duplicates, closed locations",
    },
    {
      type: "review",
      label: "Customer Review",
      icon: <Star className="w-4 h-4 text-amber-500" />,
      color: "border-amber-500/40 bg-amber-500/5",
      desc: "Defamation, profanity, fake ratings",
    },
    {
      type: "user",
      label: "User Account",
      icon: <Users className="w-4 h-4 text-emerald-500" />,
      color: "border-emerald-500/40 bg-emerald-500/5",
      desc: "Spam bots, harassment, impersonation",
    },
    {
      type: "media",
      label: "Media Asset",
      icon: <Camera className="w-4 h-4 text-purple-500" />,
      color: "border-purple-500/40 bg-purple-500/5",
      desc: "Copyright theft, offensive images",
    },
  ];

  const REASON_PRESETS: Record<ReportType, string[]> = {
    business: [
      "Fraud / Unlicensed Financial Scam",
      "Duplicate or Cloned Business Profile",
      "Permanently Closed or Non-Existent Address",
      "Impersonation / Unauthorized Trademark Use",
      "Health / Safety Regulatory Non-Compliance",
    ],
    review: [
      "Competitor Abusive Defamation",
      "Hate Speech, Slurs & Harassment",
      "Promotional Links & External Spam",
      "Coordinated Bot Review Manipulation",
      "Extortion / Blackmail Review Threats",
    ],
    user: [
      "Mass Spam DMs & Automated Bot Behavior",
      "Impersonation of Staff / Public Officials",
      "Financial Extortion & Review Blackmail",
      "Harassment / Threatening Messages",
    ],
    media: [
      "Copyright Infringement / Watermark Theft",
      "Explicit or Inappropriate Visual Content",
      "Misleading Stock Photo as Local Facility",
      "Low Quality or Irrelevant Imagery",
    ],
  };

  const handleSelectType = (t: ReportType) => {
    setReportType(t);
    const presets = REASON_PRESETS[t];
    if (presets && presets.length > 0) {
      setReason(presets[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a short descriptive incident title.");
      return;
    }
    if (!targetName.trim()) {
      toast.error("Please specify the target entity name being reported.");
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedTargetId =
        targetId.trim() ||
        `${reportType.slice(0, 3)}-${Date.now().toString().slice(-5)}`;

      const payload = {
        type: reportType,
        title: title.trim(),
        reason: reason.trim(),
        details: details.trim() || undefined,
        targetId: generatedTargetId,
        targetName: targetName.trim(),
        targetType: reportType,
        reporterName: reporterName.trim() || "Admin Officer",
        reporterEmail: reporterEmail.trim() || undefined,
        reporterRole: "admin",
        priority,
        status: "under_review",
        city: city.trim() || "Addis Ababa",
        country: country.trim() || "Ethiopia",
        evidenceUrls: evidenceUrl.trim() ? [evidenceUrl.trim()] : undefined,
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit report");
      }

      toast.success(
        `Incident ${data.data.id} registered into active moderation queue!`
      );

      onReportRegistered(data.data);
      onClose();

      // Reset form fields
      setTitle("");
      setDetails("");
      setEvidenceUrl("");
      if (!preselectedTargetName) setTargetName("");
      if (!preselectedTargetId) setTargetId("");
    } catch (err: any) {
      console.error("Register report error:", err);
      toast.error(err.message || "Failed to register report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl bg-card border border-border shadow-2xl">
        {/* Header with high-contrast badge banner */}
        <div className="relative p-6 bg-gradient-to-r from-red-500/15 via-amber-500/10 to-transparent border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                Register Real Incident / Report
                <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px] font-bold">
                  Moderation Queue
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                File a verified incident ticket directly into the live moderation ledger with full audit traceability.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Entity Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              1. Select Incident Target Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleSelectType(opt.type)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    reportType === opt.type
                      ? `${opt.color} border-primary shadow-sm ring-1 ring-primary/40 font-bold`
                      : "border-border/70 hover:border-border hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {opt.icon}
                    <span className="text-xs font-bold text-foreground">{opt.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Target Entity Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Bole Crypto Forex or Review #102"
                required
                className="text-xs rounded-xl"
              />
              {reportType === "business" && businessesList.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1 overflow-x-auto pb-1 text-[11px] text-muted-foreground">
                  <span className="shrink-0 text-[10px] font-semibold">Quick select:</span>
                  {businessesList.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setTargetName(b.name);
                        setTargetId(b.id);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-muted hover:bg-primary/15 text-primary text-[10px] font-bold shrink-0 transition-colors"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Target Entity ID (Optional)
              </label>
              <Input
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                placeholder="e.g. biz-1, rev-402, usr-99"
                className="text-xs font-mono rounded-xl"
              />
            </div>
          </div>

          {/* Incident Title & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Incident Headline / Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unlicensed High-Yield Crypto Scam operating in Bole"
                required
                className="text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Severity / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ReportPriority)}
                className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="critical">🔴 Critical (Immediate Action)</option>
                <option value="high">🟠 High (24h SLA)</option>
                <option value="medium">🔵 Medium (Standard)</option>
                <option value="low">⚪ Low (Routine)</option>
              </select>
            </div>
          </div>

          {/* Violation Category / Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>Primary Violation Reason</span>
              <span className="text-[11px] text-muted-foreground font-normal">Choose preset or type below</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {REASON_PRESETS[reportType].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    reason === r
                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                      : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Or type custom violation reason..."
              className="text-xs rounded-xl"
              required
            />
          </div>

          {/* Detailed Evidence / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Incident Evidence & Audit Details
            </label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Provide context, customer complaints received, URLs, or factual findings supporting this moderation action..."
              className="text-xs rounded-xl resize-none"
            />
          </div>

          {/* Evidence URL & City/Country */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Evidence Link / Screenshot URL</label>
              <Input
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or cloud document link"
                className="text-xs font-mono rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">City Jurisdiction</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Addis Ababa"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Reporter Attribution */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {reporterName.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-foreground">Reporting Admin: </span>
                <span className="text-muted-foreground">{reporterName}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              ✓ Verified Staff Audit
            </Badge>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="gap-2 text-xs font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording Incident…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  File & Register Incident
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
