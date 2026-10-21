"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  FileText,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Download,
  UserCheck,
  Calendar,
  Lock,
  Layers,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";

type StatusStage = "submitted" | "under_review" | "verified" | "dashboard_granted";

const STAGES: { id: StatusStage; label: string; number: number; desc: string }[] = [
  {
    id: "submitted",
    label: "Submitted",
    number: 1,
    desc: "Application logged with representative credentials & e-signature",
  },
  {
    id: "under_review",
    label: "Under Review",
    number: 2,
    desc: "Domain match validated, SMS OTP confirmed, and TIN verified",
  },
  {
    id: "verified",
    label: "Verified",
    number: 3,
    desc: "Administrative audit cleared with zero disputes",
  },
  {
    id: "dashboard_granted",
    label: "Dashboard Granted",
    number: 4,
    desc: "Full owner permissions, hours editor, and Recharts analytics unlocked",
  },
];

export default function ClaimStatusTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Default stage is "under_review", can be toggled by the user or synced from real API
  const [activeStage, setActiveStage] = useState<StatusStage>("under_review");
  const [isCopied, setIsCopied] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/claims/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.claim) {
          setClaimData(data.claim);
          if (data.claim.status === "approved") {
            setActiveStage("dashboard_granted");
          } else if (data.claim.status === "pending") {
            setActiveStage("under_review");
          }
        }
      })
      .catch(() => {});
  }, [id]);

  const business = SEED_BUSINESSES[0]; // Kategna Ethiopian Restaurant

  const getStageIndex = (st: StatusStage) => {
    return STAGES.findIndex((s) => s.id === st);
  };

  const currentIndex = getStageIndex(activeStage);

  const handleCopyClaimId = () => {
    navigator.clipboard?.writeText(id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 py-6 xs:py-8 sm:py-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 space-y-4 xs:space-y-5 sm:space-y-6">
        {/* Breadcrumb / Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 xs:gap-3">
          <Link
            href="/claim"
            className="inline-flex items-center gap-1.5 text-[11px] xs:text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> Back to Claim Portal
          </Link>

          {/* Interactive Simulation Switcher */}
          <div className="flex items-center gap-1 p-0.5 xs:p-1 bg-slate-100 dark:bg-slate-900 rounded-xl xs:rounded-2xl border border-border overflow-x-auto no-scrollbar max-w-full">
            <span className="text-[9px] xs:text-[10px] font-bold text-muted-foreground uppercase px-1.5 xs:px-2 shrink-0">
              Simulate:
            </span>
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStage(s.id)}
                className={`px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-lg xs:rounded-xl text-[10px] xs:text-[11px] font-bold transition-all shrink-0 ${
                  activeStage === s.id
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Claim Header Card */}
        <div className="bg-card rounded-2xl xs:rounded-3xl border border-border p-4 xs:p-6 sm:p-8 shadow-sm space-y-4 xs:space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 pb-4 xs:pb-6 border-b border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyClaimId}
                  className="font-mono text-[10px] xs:text-xs font-black text-primary px-2 xs:px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                  title="Click to copy Claim ID"
                >
                  {id} {isCopied ? "✓ Copied" : ""}
                </button>
                <Badge
                  variant={
                    activeStage === "dashboard_granted" || activeStage === "verified"
                      ? "success"
                      : "warning"
                  }
                  className="text-[9px] xs:text-[10px] font-bold capitalize py-0"
                >
                  {activeStage.replace("_", " ")}
                </Badge>
              </div>
              <h1 className="text-lg xs:text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Ownership Claim for {business.name}
              </h1>
              <p className="text-[10px] xs:text-xs text-muted-foreground">
                Submitted on {new Date().toLocaleDateString()} • Verified via Official Domain, SMS & MoTRI License
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeStage !== "dashboard_granted" ? (
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => setActiveStage("dashboard_granted")}
                  className="h-7.5 xs:h-8 sm:h-9 gap-1 xs:gap-1.5 text-xs font-bold px-3 xs:px-4 shadow-md w-full sm:w-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Fast-Track Approval
                </Button>
              ) : (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="gradient"
                    className="h-7.5 xs:h-8 sm:h-9 gap-1 xs:gap-1.5 text-xs font-bold px-3 xs:px-4 shadow-md shadow-emerald-500/10 w-full sm:w-auto"
                  >
                    Open Owner Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* 4-Stage Progress Tracker Bar */}
          <div className="space-y-3 xs:space-y-4 pt-1 xs:pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 xs:gap-3">
              {STAGES.map((s, idx) => {
                const isPassed = currentIndex > idx;
                const isCurrent = activeStage === s.id;

                return (
                  <div
                    key={s.id}
                    className={`p-3 xs:p-3.5 sm:p-4 rounded-xl xs:rounded-2xl border transition-all flex flex-col justify-between gap-2.5 xs:gap-3 ${
                      isCurrent
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : isPassed
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border/60 bg-slate-50/50 dark:bg-slate-900/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-6 h-6 xs:w-7 xs:h-7 rounded-lg xs:rounded-xl flex items-center justify-center text-[10px] xs:text-xs font-black ${
                          isPassed || (isCurrent && activeStage === "dashboard_granted")
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPassed ? "✓" : s.number}
                      </div>
                      <Badge
                        variant={isPassed || isCurrent ? "secondary" : "outline"}
                        className="text-[8px] xs:text-[9px] py-0 px-1.5 font-bold"
                      >
                        {isPassed ? "Done" : isCurrent ? "Active" : "Pending"}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-[11px] xs:text-xs text-foreground">
                        {s.number}. {s.label}
                      </h4>
                      <p className="text-[9px] xs:text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grant Banner (When Dashboard is Granted) */}
          {activeStage === "dashboard_granted" && (
            <div className="p-3.5 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 xs:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2.5 xs:gap-3">
                <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-xl xs:rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-4 h-4 xs:w-5 xs:h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs xs:text-sm text-foreground">
                    Ownership Granted! Full Dashboard Access Ready
                  </h4>
                  <p className="text-[10px] xs:text-xs text-muted-foreground">
                    You can now manage live opening hours, post menu photos, and respond officially to customer reviews.
                  </p>
                </div>
              </div>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="sm" variant="gradient" className="w-full sm:w-auto font-bold shrink-0 h-7.5 xs:h-8 sm:h-9 text-xs px-3 xs:px-4 shadow-md">
                  Launch Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Split Detail Grid: Listing Profile + Claimant Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-4 pt-1 xs:pt-2">
            {/* Box 1: Business Information */}
            <div className="p-3.5 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 xs:space-y-3.5">
              <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Target Business Entity
              </span>

              <div className="flex items-start gap-2.5 xs:gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={business.coverUrl || "/placeholder-business.jpg"}
                  alt={business.name}
                  className="w-11 h-11 xs:w-14 xs:h-14 rounded-lg xs:rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs xs:text-sm text-foreground truncate">{business.name}</h4>
                  <p className="text-[11px] xs:text-xs text-muted-foreground truncate">
                    {business.categoryName} • {business.districtName || business.cityName}
                  </p>
                  <p className="text-[10px] xs:text-[11px] text-muted-foreground mt-0.5 truncate">
                    {business.addressLine}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 text-[10px] xs:text-xs space-y-1 text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Public Phone:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {business.telephone || "+251 11 600 0000"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registered TIN:</span>
                  <span className="font-mono text-foreground font-semibold">
                    ET-009842104
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Claimant Dossier */}
            <div className="p-3.5 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 xs:space-y-3.5">
              <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Representative Credentials
              </span>

              <div className="space-y-1.5 xs:space-y-2 text-[10px] xs:text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Claimant Name:</span>
                  <span className="font-bold text-foreground">Samuel Kebede</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="secondary" className="text-[9px] xs:text-[10px] font-bold py-0">
                    Owner / Founder
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">National ID:</span>
                  <span className="font-mono text-foreground font-semibold">ET-9842104</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Signature:</span>
                  <span className="italic font-serif text-emerald-600 dark:text-emerald-400 font-bold">
                    Samuel Kebede [E-SIGNED]
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 text-[10px] xs:text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Method:</span>
                <span className="font-bold text-foreground">Domain Email + SMS</span>
              </div>
            </div>
          </div>

          {/* Audit Log Timeline */}
          <div className="p-3.5 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5 xs:space-y-3">
            <h4 className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Audit & Verification Event Log
            </h4>

            <div className="space-y-2 text-[10px] xs:text-xs">
              <div className="flex items-center justify-between text-muted-foreground gap-2">
                <span className="flex items-center gap-1.5 xs:gap-2 truncate">
                  <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 shrink-0" />
                  Digital Claim Application Logged & E-Signed
                </span>
                <span className="text-[9px] xs:text-[10px] font-mono shrink-0">10 mins ago</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground gap-2">
                <span className="flex items-center gap-1.5 xs:gap-2 truncate">
                  <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 shrink-0" />
                  6-Digit SMS Security Code PIN Confirmed
                </span>
                <span className="text-[9px] xs:text-[10px] font-mono shrink-0">8 mins ago</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground gap-2">
                <span className="flex items-center gap-1.5 xs:gap-2 truncate">
                  <span
                    className={`w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full shrink-0 ${
                      currentIndex >= 2 ? "bg-emerald-500" : "bg-amber-500 animate-ping"
                    }`}
                  />
                  Trade License (MoTRI) Registry Cross-Check
                </span>
                <span className="text-[9px] xs:text-[10px] font-mono shrink-0">
                  {currentIndex >= 2 ? "Passed" : "Processing"}
                </span>
              </div>

              {currentIndex >= 3 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold gap-2">
                  <span className="flex items-center gap-1.5 xs:gap-2 truncate">
                    <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-emerald-500 shrink-0" />
                    Listing Ownership Granted & Management Activated
                  </span>
                  <span className="text-[9px] xs:text-[10px] font-mono shrink-0">Just now</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 xs:pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 xs:gap-3">
            <span className="text-[10px] xs:text-xs text-muted-foreground">
              Need assistance? Contact support at <a href="mailto:support@bizfinder.io" className="text-primary hover:underline font-semibold">support@bizfinder.io</a>
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="h-7.5 xs:h-8 sm:h-9 text-xs font-bold gap-1 xs:gap-1.5 flex-1 sm:flex-none">
                <Download className="w-3.5 h-3.5" /> Download Receipt
              </Button>
              <Link href="/dashboard" className="flex-1 sm:flex-none">
                <Button variant="gradient" size="sm" className="h-7.5 xs:h-8 sm:h-9 text-xs font-bold gap-1 xs:gap-1.5 w-full shadow-md">
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
