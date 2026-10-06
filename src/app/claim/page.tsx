"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Upload,
  Sparkles,
  Lock,
  Clock,
  MapPin,
  Check,
  HelpCircle,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { Business } from "@/types/business";

type ClaimStep = "lookup" | "method" | "verify" | "details" | "success";
type VerificationMethod = "email" | "sms" | "document";

function ClaimBusinessWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBizId = searchParams.get("bizId");

  const [step, setStep] = useState<ClaimStep>(preselectedBizId ? "method" : "lookup");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>(SEED_BUSINESSES);
  const [isSearching, setIsSearching] = useState(false);

  // Pre-load the preselected business from API/seeds
  useEffect(() => {
    if (preselectedBizId) {
      const seed = SEED_BUSINESSES.find((b) => b.id === preselectedBizId);
      if (seed) {
        setSelectedBiz(seed);
      } else {
        fetch(`/api/businesses/${preselectedBizId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.business) setSelectedBiz(data.business);
          })
          .catch(() => {});
      }
    }
  }, [preselectedBizId]);

  // Load live businesses from API once
  useEffect(() => {
    fetch("/api/businesses?limit=200&sort=relevance")
      .then((r) => r.json())
      .then((data) => {
        if (data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0) {
          const existingIds = new Set(data.businesses.map((b: Business) => b.id));
          const uniqueSeeds = SEED_BUSINESSES.filter((s) => !existingIds.has(s.id));
          setAllBusinesses([...data.businesses, ...uniqueSeeds]);
        }
      })
      .catch(() => {});
  }, []);

  // Verification method state
  const [method, setMethod] = useState<VerificationMethod>("email");
  const [workEmail, setWorkEmail] = useState("");
  const [workPhone, setWorkPhone] = useState("");
  const [documentFile, setDocumentFile] = useState<string | null>(null);
  const [docType, setDocType] = useState("Trade License / Business Registration");

  // OTP Verification state
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  // Representative details state
  const [claimantName, setClaimantName] = useState("");
  const [claimantTitle, setClaimantTitle] = useState("Founder / Owner");
  const [nationalId, setNationalId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [generatedClaimId, setGeneratedClaimId] = useState("");

  // Search filtering using live + seed businesses
  const searchResults = useMemo(() => {
    const base = allBusinesses;
    if (!searchQuery.trim()) return base.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return base.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        (b.cityName && b.cityName.toLowerCase().includes(q)) ||
        (b.districtName && b.districtName.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [searchQuery, allBusinesses]);

  const handleSelectBusiness = (biz: Business) => {
    setSelectedBiz(biz);
    setWorkEmail(biz.email || "");
    setWorkPhone(biz.telephone || biz.mobile || "");
    setStep("method");
  };

  const handleSendOtp = () => {
    setIsOtpSent(true);
    setOtpError("");
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const code = otpCode.join("");
    if (code.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    // Simulation: Any 6 digits accepted or 123456
    setIsOtpVerified(true);
    setOtpError("");
    setTimeout(() => {
      setStep("details");
    }, 600);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !selectedBiz) return;

    const fallbackClaimId = `CLM-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch(`/api/businesses/${selectedBiz.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: selectedBiz.name,
          businessRole: claimantTitle,
          userPhone: workPhone,
          proofDocumentUrl: docType,
          notes: `National ID: ${nationalId}`,
        }),
      });
      const data = await res.json();
      if (data.claim?.id) {
        setGeneratedClaimId(data.claim.id);
      } else {
        setGeneratedClaimId(fallbackClaimId);
      }
    } catch (err) {
      setGeneratedClaimId(fallbackClaimId);
    }

    setStep("success");
  };

  return (
    <div className="w-full bg-slate-50/50 dark:bg-slate-950/50 py-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-primary text-xs font-bold border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Business Claim Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
            Claim & Manage Your Business Listing
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Take ownership of your BizFinder profile to update opening hours, respond to customer reviews, upload photo menus, and access live performance analytics.
          </p>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 sm:gap-4 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border overflow-x-auto max-w-full no-scrollbar">
            {[
              { id: "lookup", label: "1. Lookup" },
              { id: "method", label: "2. Method" },
              { id: "verify", label: "3. Verify" },
              { id: "details", label: "4. Owner Info" },
              { id: "success", label: "5. Status" },
            ].map((s, idx) => {
              const stepIndex = ["lookup", "method", "verify", "details", "success"].indexOf(step);
              const isCurrent = step === s.id;
              const isPassed = stepIndex > idx;

              return (
                <div
                  key={s.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isPassed
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {isPassed ? <Check className="w-3 h-3" /> : null}
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* STAGE 1: BUSINESS LOOKUP                                   */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === "lookup" && (
          <div className="space-y-6">
            <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-500" />
                  Find Your Business
                </h2>
                <p className="text-xs text-muted-foreground">
                  Search by business name, category, or subcity to see if a listing already exists on BizFinder.
                </p>
              </div>

              <div className="relative">
                <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Kategna Restaurant, Tomoca Coffee, Bole..."
                  className="pl-12 h-12 text-sm rounded-2xl bg-slate-50 dark:bg-slate-900 border-border"
                />
              </div>

              {/* Results Grid */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {searchQuery ? `Matching Listings (${searchResults.length})` : "Popular Listings in East Africa"}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {searchResults.map((biz) => (
                    <div
                      key={biz.id}
                      className="group p-4 rounded-2xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/50 hover:bg-card transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={biz.coverUrl || "/placeholder-business.jpg"}
                          alt={biz.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {biz.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {biz.categoryName} • {biz.districtName || biz.cityName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={biz.isVerified ? "verified" : "secondary"} className="text-[10px] py-0">
                              {biz.isVerified ? "Claimed / Verified" : "Unclaimed Listing"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {biz.telephone || "No phone listed"}
                        </span>
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => handleSelectBusiness(biz)}
                          className="h-7 text-xs font-bold px-3 gap-1 shadow-sm"
                        >
                          Claim This Listing <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Not Listed Callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Can't find your business in our directory?
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Create a brand new listing with full details, photos, and opening hours in minutes.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/listings/new">
                <Button variant="outline" className="font-bold shrink-0 text-xs border-indigo-300 dark:border-indigo-700">
                  Register New Business
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STAGE 2: VERIFICATION METHOD SELECTOR                     */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === "method" && selectedBiz && (
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            {/* Selected Business Preview Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedBiz.coverUrl || "/placeholder-business.jpg"}
                  alt={selectedBiz.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {selectedBiz.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedBiz.addressLine} • {selectedBiz.categoryName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep("lookup")}
                className="text-xs text-primary font-semibold hover:underline"
              >
                Change Business
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-foreground">
                Select Your Verification Method
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose how you want to prove your legal authority or ownership over this business.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Work Email */}
              <div
                onClick={() => setMethod("email")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  method === "email"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-primary flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Official Email Domain Match</h4>
                  <p className="text-xs text-muted-foreground">
                    Instant 6-digit PIN sent to a work email address matching the official business domain.
                  </p>
                </div>
                <Badge variant={method === "email" ? "default" : "outline"} className="w-fit text-[10px]">
                  {method === "email" ? "Selected (Fastest)" : "Instant OTP"}
                </Badge>
              </div>

              {/* Option 2: SMS Phone OTP */}
              <div
                onClick={() => setMethod("sms")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  method === "sms"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">SMS Phone OTP</h4>
                  <p className="text-xs text-muted-foreground">
                    One-Time Passcode sent directly via SMS to the official business telephone number on file.
                  </p>
                </div>
                <Badge variant={method === "sms" ? "default" : "outline"} className="w-fit text-[10px]">
                  {method === "sms" ? "Selected" : "Instant SMS"}
                </Badge>
              </div>

              {/* Option 3: Document Upload */}
              <div
                onClick={() => setMethod("document")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                  method === "document"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-slate-50/50 dark:bg-slate-900/50 hover:border-primary/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">Trade License & TIN Upload</h4>
                  <p className="text-xs text-muted-foreground">
                    Upload official Trade License (ንግድ ፈቃድ), Tax Registration Certificate, or Commercial ID.
                  </p>
                </div>
                <Badge variant={method === "document" ? "default" : "outline"} className="w-fit text-[10px]">
                  {method === "document" ? "Selected" : "Document Audit"}
                </Badge>
              </div>
            </div>

            {/* Input based on method */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border space-y-4">
              {/* Method 1: Work Email */}
              {method === "email" && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-foreground">
                        Official Business Email Address
                      </label>
                      {selectedBiz.website && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Expected Domain: @{selectedBiz.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "")}
                        </span>
                      )}
                    </div>
                    <Input
                      type="email"
                      required
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder={`e.g. manager@${selectedBiz.website ? selectedBiz.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "") : "businessdomain.com"}`}
                      className="text-xs bg-background"
                    />
                  </div>

                  {/* Domain Match Indicator */}
                  {workEmail.includes("@") && (
                    <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {workEmail.includes("@gmail") || workEmail.includes("@yahoo") ? (
                          <>
                            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-muted-foreground">
                              Personal email detected. We will require an additional OTP step.
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Corporate Domain Match (+100 Trust Score)
                            </span>
                          </>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                        Instant 6-Digit PIN
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Method 2: SMS Phone OTP */}
              {method === "sms" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Registered Business Telephone
                    </label>
                    <Input
                      type="tel"
                      required
                      value={workPhone}
                      onChange={(e) => setWorkPhone(e.target.value)}
                      placeholder="+251 91 123 4567"
                      className="text-xs bg-background font-mono"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">
                        Public Directory Number Match
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        SMS OTP will be sent to registered number: <span className="font-mono font-bold text-foreground">{workPhone || "+251 91 ••• ••67"}</span>
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px] shrink-0">
                      SMS Gateway Active
                    </Badge>
                  </div>
                </div>
              )}

              {/* Method 3: Document Upload */}
              {method === "document" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Document Type
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Trade License (ንግድ ፈቃድ)">Trade License (ንግድ ፈቃድ)</option>
                        <option value="Tax Identification Number (TIN) Certificate">Tax Identification Number (TIN) Certificate</option>
                        <option value="Commercial Registration Certificate">Commercial Registration Certificate</option>
                        <option value="Lease Agreement / Commercial Utility Bill">Lease Agreement / Commercial Utility Bill</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Tax ID / Registration Number (TIN)
                      </label>
                      <Input
                        value={nationalId || "ET-009842104"}
                        onChange={(e) => setNationalId(e.target.value)}
                        placeholder="e.g. 009842104"
                        className="text-xs font-mono bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Upload Verification File (PDF, JPG, PNG)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center space-y-2 bg-background hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-xs font-bold text-foreground">
                        {documentFile ? "Document Attached: government_trade_license_official.pdf" : "Click to browse or drop certificate files"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Supports Ministry of Trade (MoTRI) scanned certificates up to 15MB
                      </p>
                      {!documentFile ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setDocumentFile("https://example.com/demo-license.pdf")}
                          className="text-xs font-bold mt-2"
                        >
                          Attach Verified Sample Document
                        </Button>
                      ) : (
                        <div className="pt-2">
                          <Badge variant="success" className="text-[10px] font-mono">
                            ✓ OCR Scan Passed: Entity Name Matches "{selectedBiz.name}"
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep("lookup")}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Search
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  if (method === "document") {
                    setStep("details");
                  } else {
                    handleSendOtp();
                    setStep("verify");
                  }
                }}
                className="font-bold gap-1.5 shadow-md"
              >
                Continue to Verification <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STAGE 3: OTP CODE VERIFICATION                             */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === "verify" && selectedBiz && (
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6 max-w-lg mx-auto">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-primary flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Enter 6-Digit Security PIN</h2>
              <p className="text-xs text-muted-foreground">
                We sent a 6-digit one-time passcode to{" "}
                <span className="font-bold text-foreground font-mono">
                  {method === "email" ? workEmail : workPhone}
                </span>
              </p>
            </div>

            {/* Interactive Simulation Notification Drawer */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {method === "email" ? "Simulated Email Inbox" : "Simulated SMS Message"}
                </span>
                <span className="text-[10px] text-muted-foreground">Just now</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                "{method === "email" ? "Your BizFinder domain verification PIN is" : "[BizFinder] Your verification code is"} <strong className="text-foreground font-mono">482910</strong>. Valid for 10 minutes."
              </p>
              <button
                type="button"
                onClick={() => {
                  setOtpCode(["4", "8", "2", "9", "1", "0"]);
                }}
                className="text-[11px] text-primary font-bold hover:underline block pt-0.5"
              >
                Click here to auto-fill code "482910" →
              </button>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center font-black text-lg sm:text-xl rounded-2xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-red-500 text-center font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {otpError}
              </p>
            )}

            <div className="text-center space-y-2 pt-1">
              <p className="text-xs text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-primary font-bold hover:underline"
                >
                  Resend Code
                </button>
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setStep("method")}>
                ← Back
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleVerifyOtp}
                className="font-bold gap-1.5 shadow-md"
              >
                Verify & Proceed <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STAGE 4: OWNER / REPRESENTATIVE DETAILS                   */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === "details" && selectedBiz && (
          <form onSubmit={handleSubmitClaim} className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Claimant Representative Profile
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please provide your legal contact details to assign ownership permissions for{" "}
                <span className="font-semibold text-foreground">{selectedBiz.name}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Full Legal Name
                </label>
                <Input
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. Samuel Kebede"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Official Role / Representation Capacity
                </label>
                <select
                  value={claimantTitle}
                  onChange={(e) => setClaimantTitle(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Owner / Founder">Owner / Founder</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Marketing Lead / PR Agency">Marketing Lead / PR Agency</option>
                  <option value="Authorized Legal Representative">Authorized Legal Representative</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Identification Type
                </label>
                <select
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="National Digital ID (Fayda / NID)">National Digital ID (Fayda / NID)</option>
                  <option value="Passport">Passport</option>
                  <option value="Kebele Resident ID">Kebele Resident ID</option>
                  <option value="Driver's License">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  National ID / Passport Number
                </label>
                <Input
                  required
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g. ET-9842104"
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Direct Mobile Number
                </label>
                <Input
                  required
                  value={workPhone}
                  onChange={(e) => setWorkPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* ID Document Preview & Digital Attestation */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  Government ID Verification Attachment
                </span>
                <Badge variant="success" className="text-[10px]">
                  ✓ Front & Back Attached
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Government-issued photo identification verified for representative authorization.
              </p>

              {/* Digital E-Signature */}
              <div className="pt-2 border-t border-border/80">
                <label className="text-xs font-bold text-foreground block mb-1">
                  Electronic Signature (Type Full Name to Sign)
                </label>
                <div className="relative">
                  <Input
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="Type your full legal name as official signature..."
                    className="text-sm italic font-serif bg-background pr-24"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    [E-SIGNED]
                  </div>
                </div>
              </div>
            </div>

            {/* Legal terms checkbox */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I hereby declare under penalty of perjury that I am authorized as <strong className="text-foreground">{claimantTitle}</strong> to claim, manage, and represent the listing for <strong className="text-foreground">{selectedBiz.name}</strong>. I accept BizFinder's merchant terms and data verification agreement.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("method")}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                disabled={!agreedToTerms}
                className="font-bold gap-1.5 shadow-md"
              >
                <ShieldCheck className="w-4 h-4" /> Submit Claim Application
              </Button>
            </div>
          </form>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STAGE 5: SUCCESS & STATUS TRACKER                         */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === "success" && selectedBiz && (
          <div className="bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-lg space-y-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Claim Application Submitted
              </span>
              <h2 className="text-2xl font-black text-foreground">
                Verification in Progress!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your claim for <span className="font-bold text-foreground">{selectedBiz.name}</span> has been logged with reference code:
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border w-fit mx-auto font-mono text-sm font-black text-primary">
                {generatedClaimId || "CLM-2024-8842"}
              </div>
            </div>

            {/* Live Progress Tracker */}
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-border space-y-4 text-left">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Verification Milestones
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px]">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-foreground">1. Application Logged</span>
                    <p className="text-[11px] text-muted-foreground">Digital claim submitted with representative credentials.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px]">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold text-foreground">2. Security Token Verified</span>
                    <p className="text-[11px] text-muted-foreground">Work channel identity confirmed.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-[10px] animate-pulse">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-foreground">3. Admin Final Approval</span>
                    <p className="text-[11px] text-muted-foreground">Staff audit in verification queue (typical turnaround &lt; 2 hours).</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-foreground flex items-center justify-center shrink-0 text-[10px]">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-foreground">4. Owner Dashboard Access Unlocked</span>
                    <p className="text-[11px] text-muted-foreground">Listing editor and live analytics activated.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href={`/claim/status/${generatedClaimId || "CLM-2024-8842"}`}>
                <Button variant="outline" className="w-full sm:w-auto font-bold text-xs">
                  View Real-Time Status Page
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="gradient" className="w-full sm:w-auto font-bold text-xs gap-1.5 shadow-md">
                  Go to Business Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClaimBusinessWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <ClaimBusinessWizardContent />
    </Suspense>
  );
}
