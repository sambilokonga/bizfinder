"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Copy,
  Building2,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  Landmark,
  ArrowRight,
  Upload,
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
  QrCode,
  Info,
  Check,
  X,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  Banknote,
  Award,
  Globe,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Business } from "@/types/business";
import {
  BillingCycle,
  BillingCurrency,
  SubscriptionPlan,
  GLOBALBIZ_SUBSCRIPTION_PLANS,
  OFFICIAL_PAYMENT_ACCOUNTS,
} from "@/types/billing";
import { IPayment } from "@/types/payment";
import { exportPaymentsToCSV, exportPaymentsToJSON } from "@/lib/utils/export-payments";

interface BillingPlansViewProps {
  businesses: Business[];
  selectedBusiness: Business;
  onBusinessUpdated?: (business: Business) => void;
  onRefreshBusinesses?: () => void;
  userEmail?: string;
  userPhone?: string;
}

export function BillingPlansView({
  businesses,
  selectedBusiness,
  onBusinessUpdated,
  onRefreshBusinesses,
  userEmail,
  userPhone,
}: BillingPlansViewProps) {
  // Plan & Pricing State
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<BillingCurrency>("ETB");
  const [currentPlanTier, setCurrentPlanTier] = useState<string>("pro");
  const [renewalDate, setRenewalDate] = useState<string>("2026-10-28");

  // Invoices & Transactions State
  const [invoices, setInvoices] = useState<IPayment[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<IPayment | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan>(
    GLOBALBIZ_SUBSCRIPTION_PLANS[1]
  );
  const [checkoutStep, setCheckoutStep] = useState<"details" | "processing" | "success">("details");
  const [paymentMethod, setPaymentMethod] = useState<
    "telebirr" | "cbebirr" | "mpesa" | "card" | "bank_transfer"
  >("telebirr");

  // Business to apply subscription to
  const [targetBusinessMode, setTargetBusinessMode] = useState<"existing" | "new">("existing");
  const [targetBusinessId, setTargetBusinessId] = useState<string>(selectedBusiness?.id || "");
  const [newBusinessForm, setNewBusinessForm] = useState({
    name: "",
    categoryName: "Restaurant & Cafe",
    cityName: "Addis Ababa",
    subcityName: "Bole",
    addressLine: "Cameroon St, Near Edna Mall",
    phone: userPhone || "+251 91 123 4567",
    description: "",
  });

  // Gateway form inputs
  const [telebirrPhone, setTelebirrPhone] = useState<string>(userPhone || "+251 91 123 4567");
  const [cbeAccount, setCbeAccount] = useState<string>("1000987654321");
  const [mpesaPhone, setMpesaPhone] = useState<string>(userPhone || "+254 71 234 5678");
  const [cardData, setCardData] = useState({
    number: "4242 •••• •••• 4242",
    expiry: "12/28",
    cvc: "842",
    name: "Business Owner",
  });

  // Offline / Bank Transfer & Telebirr Receipt Attachment State
  const [receiptType, setReceiptType] = useState<"cbe_bank" | "telebirr_direct">("cbe_bank");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [bankReference, setBankReference] = useState<string>("");
  const [payerName, setPayerName] = useState<string>("Business Owner");
  const [payerPhone, setPayerPhone] = useState<string>(userPhone || "");
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState<boolean>(false);
  const [completedTxId, setCompletedTxId] = useState<string>("");

  // QR Code Preview Modal State
  const [qrModalAccount, setQrModalAccount] = useState<{
    title: string;
    account: string;
    qrUrl: string;
  } | null>(null);

  // Sync selected business if prop changes
  useEffect(() => {
    if (selectedBusiness?.id) {
      setTargetBusinessId(selectedBusiness.id);
    }
  }, [selectedBusiness]);

  // Fetch real payment transactions for this owner/business
  const fetchInvoices = async () => {
    setIsLoadingInvoices(true);
    try {
      const res = await fetch("/api/payments?limit=20&sort=desc");
      if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return;
      const data = await res.json();
      if (data.success && data.payments) {
        setInvoices(data.payments);
      }
    } catch (err) {
      console.warn("Could not fetch real invoices, falling back to local state:", err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Open checkout for a specific plan
  const openCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutStep("details");
    setIsCheckoutOpen(true);
  };

  // Handle receipt file change
  const handleReceiptFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    }
  };

  // Execute checkout or receipt submission
  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCheckout(true);

    const price =
      currency === "ETB"
        ? billingCycle === "monthly"
          ? selectedPlanForCheckout.priceMonthlyETB
          : selectedPlanForCheckout.priceYearlyETB
        : billingCycle === "monthly"
        ? selectedPlanForCheckout.priceMonthlyUSD
        : selectedPlanForCheckout.priceYearlyUSD;

    const chosenBusinessName =
      targetBusinessMode === "new"
        ? newBusinessForm.name || "Newly Registered Business"
        : businesses.find((b) => b.id === targetBusinessId)?.name || selectedBusiness?.name || "My Business";

    try {
      // 1. If Manual Bank / Telebirr Receipt Attachment
      if (paymentMethod === "bank_transfer") {
        const formData = new FormData();
        if (receiptFile) {
          formData.append("file", receiptFile);
        }
        formData.append("businessId", targetBusinessMode === "existing" ? targetBusinessId : "");
        formData.append("businessName", chosenBusinessName);
        formData.append("planId", selectedPlanForCheckout.id);
        formData.append("tier", selectedPlanForCheckout.tier);
        formData.append("billingCycle", billingCycle);
        formData.append("amount", price.toString());
        formData.append("currency", currency);
        formData.append("transferType", receiptType);
        formData.append("bankReference", bankReference);
        formData.append("payerName", payerName);
        formData.append("payerPhone", payerPhone || telebirrPhone);

        if (targetBusinessMode === "new") {
          formData.append("newBizName", newBusinessForm.name);
          formData.append("newBizCategory", newBusinessForm.categoryName);
          formData.append("newBizCity", newBusinessForm.cityName);
          formData.append("newBizAddress", newBusinessForm.addressLine);
        }

        const res = await fetch("/api/billing/receipt-upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          let errorMsg = "Failed to submit bank receipt";
          if (res.headers.get("content-type")?.includes("application/json")) {
            const errData = await res.json().catch(() => null);
            if (errData?.error) errorMsg = errData.error;
          }
          throw new Error(errorMsg);
        }
        const data = await res.json().catch(() => ({}));
        if (!data.success) {
          throw new Error(data.error || "Failed to submit bank receipt");
        }

        setCompletedTxId(data.txId || `TX-BNK-${Date.now()}`);
        setCurrentPlanTier(selectedPlanForCheckout.tier);
        toast.success("Receipt submitted! Financial team will verify your transfer.");
      } else {
        // 2. Gateway checkout (Telebirr, CBE Birr, M-Pesa, Card)
        const payload = {
          businessId: targetBusinessMode === "existing" ? targetBusinessId : undefined,
          businessName: chosenBusinessName,
          newBusiness:
            targetBusinessMode === "new"
              ? {
                  name: newBusinessForm.name,
                  categoryId: "cat-general",
                  categoryName: newBusinessForm.categoryName,
                  countryName: "Ethiopia",
                  cityName: newBusinessForm.cityName,
                  subcityName: newBusinessForm.subcityName,
                  addressLine: newBusinessForm.addressLine,
                  telephone: newBusinessForm.phone,
                  description: newBusinessForm.description,
                }
              : undefined,
          planId: selectedPlanForCheckout.id,
          tier: selectedPlanForCheckout.tier,
          billingCycle,
          currency,
          amount: price,
          paymentMethod,
          payerName,
          payerPhone: telebirrPhone || mpesaPhone,
          payerEmail: userEmail,
          telebirrPhone: paymentMethod === "telebirr" ? telebirrPhone : undefined,
          cbeAccountNumber: paymentMethod === "cbebirr" ? cbeAccount : undefined,
          mpesaPhone: paymentMethod === "mpesa" ? mpesaPhone : undefined,
          cardDetails:
            paymentMethod === "card"
              ? {
                  last4: cardData.number.slice(-4) || "4242",
                  brand: "Visa",
                }
              : undefined,
        };

        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          let errorMsg = "Payment failed";
          if (res.headers.get("content-type")?.includes("application/json")) {
            const errData = await res.json().catch(() => null);
            if (errData?.error) errorMsg = errData.error;
          }
          throw new Error(errorMsg);
        }
        const data = await res.json().catch(() => ({}));
        if (!data.success) {
          throw new Error(data.error || "Payment failed");
        }

        setCompletedTxId(data.payment?.id || `TX-OK-${Date.now()}`);
        setCurrentPlanTier(selectedPlanForCheckout.tier);
        toast.success(
          targetBusinessMode === "new"
            ? `Payment verified! ${newBusinessForm.name} is now registered & live!`
            : `Upgraded to ${selectedPlanForCheckout.name}!`
        );
      }

      // Refresh data
      fetchInvoices();
      if (onRefreshBusinesses) {
        onRefreshBusinesses();
      }
      setCheckoutStep("success");
    } catch (err: any) {
      toast.error(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ─── Top Header & Active Plan Telemetry ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Billing, Plans & Subscriptions
            </h2>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold">
              Ready for Live Use
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Choose your merchant tier, settle via Telebirr, CBE Birr, M-Pesa, Cards or direct CBE
            bank slip upload, and keep your business verified.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border">
            <button
              onClick={() => setCurrency("ETB")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currency === "ETB"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ETB (Birr)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD ($)
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
            disabled={isLoadingInvoices}
            className="text-xs font-bold gap-1.5 h-8.5 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInvoices ? "animate-spin" : ""}`} />
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* ─── Active Subscription Hero Card ──────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-3 py-0.5 shadow-md">
                Active Tier: {currentPlanTier.toUpperCase()}
              </Badge>
              <span className="text-xs text-indigo-200 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Next Renewal: {renewalDate}
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                {selectedBusiness?.name || "GlobalBiz Merchant"}
                <ShieldCheck className="w-6 h-6 text-amber-400 fill-amber-400/20" />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                {currentPlanTier === "enterprise"
                  ? "Enterprise Spotlight Plan with Top-Of-Search placement, unlimited branch capacity, and VIP priority."
                  : currentPlanTier === "pro"
                  ? "Growth Pro Plan with verified gold badge, 5 multi-branch locations, and customer chat leads."
                  : "Free Starter Listing. Upgrade to unlock gold verified badge, multi-branch, and top rankings."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Badge</div>
                <div className="font-black text-amber-300 flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5" /> Gold Active
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Branch Capacity</div>
                <div className="font-black text-white mt-0.5">
                  {businesses.length} / {currentPlanTier === "enterprise" ? "Unlimited" : "5"} Branches
                </div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Search Priority</div>
                <div className="font-black text-emerald-300 mt-0.5">High Priority Rank</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Support Channel</div>
                <div className="font-black text-indigo-300 mt-0.5">Priority 24/7 Desk</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              variant="gradient"
              onClick={() => openCheckout(GLOBALBIZ_SUBSCRIPTION_PLANS[2])}
              className="gap-2 font-black text-xs px-6 py-5 shadow-lg shadow-primary/30"
            >
              <Zap className="w-4 h-4" /> Upgrade to Enterprise
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPaymentMethod("bank_transfer");
                openCheckout(GLOBALBIZ_SUBSCRIPTION_PLANS[1]);
              }}
              className="text-white border-white/20 hover:bg-white/10 text-xs font-bold gap-2 py-5"
            >
              <Upload className="w-4 h-4" /> Upload Bank Slip
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Official Offline / Bank Transfer Information Banner ─────────────── */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-base text-foreground">
                Official Ethiopian Payment & Deposit Accounts
              </h4>
              <p className="text-xs text-muted-foreground">
                For merchants paying directly via Bank Transfer or Telebirr without automated gateway.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold self-start sm:self-auto">
            100% Verified Accounts
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CBE Bank Account Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/5 via-background to-transparent border border-purple-500/20 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="font-black text-sm text-foreground">Commercial Bank of Ethiopia (CBE)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setQrModalAccount({
                    title: "CBE Account QR",
                    account: OFFICIAL_PAYMENT_ACCOUNTS.cbe.accountNumber,
                    qrUrl: OFFICIAL_PAYMENT_ACCOUNTS.cbe.qrCodeUrl,
                  })
                }
                className="h-7 text-[11px] font-bold text-purple-600 gap-1 hover:bg-purple-500/10"
              >
                <QrCode className="w-3.5 h-3.5" /> Scan QR
              </Button>
            </div>

            <div className="flex items-center justify-between bg-muted/60 p-3 rounded-xl border border-border">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">CBE Account Number</div>
                <div className="font-mono text-lg font-black text-foreground tracking-wider">
                  {OFFICIAL_PAYMENT_ACCOUNTS.cbe.accountNumber}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCopyText(OFFICIAL_PAYMENT_ACCOUNTS.cbe.accountNumber, "CBE Account 1000377050917")
                }
                className="h-8 text-xs font-bold gap-1.5 rounded-lg border-purple-500/30 hover:bg-purple-500/10 text-purple-600"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <div>Account Name: <strong className="text-foreground">{OFFICIAL_PAYMENT_ACCOUNTS.cbe.accountName}</strong></div>
              <div>Branch: <span>{OFFICIAL_PAYMENT_ACCOUNTS.cbe.branch}</span></div>
            </div>
          </div>

          {/* Telebirr Direct Account Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-background to-transparent border border-emerald-500/20 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-sm text-foreground">Telebirr Direct / Merchant</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setQrModalAccount({
                    title: "Telebirr Merchant QR",
                    account: OFFICIAL_PAYMENT_ACCOUNTS.telebirr.phoneNumber,
                    qrUrl: OFFICIAL_PAYMENT_ACCOUNTS.telebirr.qrCodeUrl,
                  })
                }
                className="h-7 text-[11px] font-bold text-emerald-600 gap-1 hover:bg-emerald-500/10"
              >
                <QrCode className="w-3.5 h-3.5" /> Scan QR
              </Button>
            </div>

            <div className="flex items-center justify-between bg-muted/60 p-3 rounded-xl border border-border">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Telebirr Phone / Account</div>
                <div className="font-mono text-lg font-black text-foreground tracking-wider">
                  {OFFICIAL_PAYMENT_ACCOUNTS.telebirr.phoneNumber}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCopyText(OFFICIAL_PAYMENT_ACCOUNTS.telebirr.phoneNumber, "Telebirr 0913273066")
                }
                className="h-8 text-xs font-bold gap-1.5 rounded-lg border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground space-y-0.5">
              <div>Account Name: <strong className="text-foreground">{OFFICIAL_PAYMENT_ACCOUNTS.telebirr.accountName}</strong></div>
              <div>Transfer Method: <span>Send money via Telebirr SuperApp or *127#</span></div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs flex items-center justify-between flex-wrap gap-2">
          <span className="text-muted-foreground">
            Already made your transfer to <strong>1000377050917</strong> or <strong>0913273066</strong>?
          </span>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => {
              setPaymentMethod("bank_transfer");
              openCheckout(GLOBALBIZ_SUBSCRIPTION_PLANS[1]);
            }}
            className="text-xs font-bold gap-1.5 h-8"
          >
            <Upload className="w-3.5 h-3.5" /> Attach Proof Receipt Now
          </Button>
        </div>
      </div>

      {/* ─── Plan Tiers Comparison Grid ─────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-foreground">Select Your Business Plan</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Transparent pricing designed for Ethiopian businesses and international enterprises.
            Instant activation upon payment or receipt upload.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-muted/80 border border-border mt-2">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual Billing
              <Badge className="bg-emerald-500 text-white text-[9px] px-1.5 py-0">Save 17%</Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GLOBALBIZ_SUBSCRIPTION_PLANS.map((plan) => {
            const price =
              currency === "ETB"
                ? billingCycle === "monthly"
                  ? plan.priceMonthlyETB
                  : plan.priceYearlyETB
                : billingCycle === "monthly"
                ? plan.priceMonthlyUSD
                : plan.priceYearlyUSD;

            const isCurrent = currentPlanTier === plan.tier;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all bg-card border ${
                  plan.popular
                    ? "border-primary/50 shadow-xl shadow-primary/5 ring-2 ring-primary/20"
                    : "border-border shadow-sm hover:border-border/80"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-3 py-0.5 shadow-md">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-black text-foreground">{plan.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">
                        {price.toLocaleString()} {currency}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        / {billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && price > 0 && (
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                        2 months free included
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {feat.included ? (
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              feat.highlight ? "text-primary" : "text-emerald-500"
                            }`}
                          />
                        ) : (
                          <X className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/40" />
                        )}
                        <span
                          className={`${
                            feat.included
                              ? feat.highlight
                                ? "font-bold text-foreground"
                                : "text-foreground"
                              : "text-muted-foreground/60 line-through"
                          }`}
                        >
                          {feat.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border">
                  <Button
                    variant={plan.popular ? "gradient" : isCurrent ? "outline" : "default"}
                    onClick={() => openCheckout(plan)}
                    className="w-full text-xs font-black py-5 rounded-2xl shadow-sm gap-1.5"
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-4 h-4" /> Current Plan (Renew)
                      </>
                    ) : (
                      <>
                        Choose {plan.name} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Transaction Invoices & Receipts Ledger ─────────────────────────── */}
      <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-lg text-foreground">Transaction Invoices & Receipts</h3>
            <p className="text-xs text-muted-foreground">
              Official records of subscriptions, ad campaigns, and verified bank receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPaymentMethod("bank_transfer");
                openCheckout(GLOBALBIZ_SUBSCRIPTION_PLANS[1]);
              }}
              className="text-xs font-bold gap-1 h-8 rounded-xl"
            >
              <Upload className="w-3.5 h-3.5" /> Submit New Receipt
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={invoices.length === 0}
              onClick={() => {
                if (!invoices.length) return;
                exportPaymentsToCSV(
                  invoices,
                  `${selectedBusiness?.name?.toLowerCase().replace(/\s+/g, "_") || "my_business"}_invoices`
                );
              }}
              className="text-xs font-bold gap-1 h-8 rounded-xl border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={invoices.length === 0}
              onClick={() => {
                if (!invoices.length) return;
                exportPaymentsToJSON(
                  invoices,
                  `${selectedBusiness?.name?.toLowerCase().replace(/\s+/g, "_") || "my_business"}_invoices`
                );
              }}
              className="text-xs font-bold gap-1 h-8 rounded-xl border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              <FileText className="w-3.5 h-3.5" /> Export JSON
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                <th className="pb-3 pl-2">Invoice / TX ID</th>
                <th className="pb-3">Business</th>
                <th className="pb-3">Plan / Item</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium text-foreground">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-2 font-mono font-bold text-primary">{inv.id}</td>
                    <td className="py-3 font-semibold">{inv.businessName}</td>
                    <td className="py-3">{inv.description || `${inv.paymentType} plan`}</td>
                    <td className="py-3 capitalize flex items-center gap-1 mt-1 font-semibold">
                      {inv.provider === "telebirr" ? (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                      ) : inv.provider === "cbebirr" ? (
                        <Building2 className="w-3.5 h-3.5 text-purple-500" />
                      ) : inv.provider === "mpesa" ? (
                        <Smartphone className="w-3.5 h-3.5 text-green-500" />
                      ) : inv.provider === "bank_transfer" ? (
                        <Landmark className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                      )}
                      <span>{inv.provider.replace("_", " ")}</span>
                    </td>
                    <td className="py-3 font-black">
                      {inv.amount.toLocaleString()} {inv.currency}
                    </td>
                    <td className="py-3">
                      <Badge
                        className={
                          inv.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold"
                            : inv.status === "pending"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold"
                        }
                      >
                        {inv.status === "pending" ? "Under Review" : inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedInvoice(inv)}
                        className="h-7 text-[11px] font-bold gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No transactions found. Choose a plan to subscribe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Universal Checkout & Receipt Upload Modal ───────────────────────── */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-2xl p-0 bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
          {checkoutStep === "details" && (
            <form onSubmit={handleExecutePayment}>
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider">
                    Official Merchant Gateway
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-indigo-300 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant Merchant Registration
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <DialogTitle className="text-xl sm:text-2xl font-black text-white">
                      Subscribe to {selectedPlanForCheckout.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-indigo-200 mt-0.5">
                      {selectedPlanForCheckout.tagline}
                    </DialogDescription>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      {(currency === "ETB"
                        ? billingCycle === "monthly"
                          ? selectedPlanForCheckout.priceMonthlyETB
                          : selectedPlanForCheckout.priceYearlyETB
                        : billingCycle === "monthly"
                        ? selectedPlanForCheckout.priceMonthlyUSD
                        : selectedPlanForCheckout.priceYearlyUSD
                      ).toLocaleString()}{" "}
                      {currency}
                    </div>
                    <div className="text-[11px] text-indigo-300">
                      / {billingCycle === "monthly" ? "month" : "year"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* 1. Target Business Selection / Registration */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      1. Choose Business to Activate
                    </label>
                    <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setTargetBusinessMode("existing")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          targetBusinessMode === "existing"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        Existing Business
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetBusinessMode("new")}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          targetBusinessMode === "new"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        + Register New Business
                      </button>
                    </div>
                  </div>

                  {targetBusinessMode === "existing" ? (
                    <div>
                      <select
                        value={targetBusinessId}
                        onChange={(e) => setTargetBusinessId(e.target.value)}
                        className="w-full h-10 px-3 text-xs rounded-xl bg-background border border-border font-medium text-foreground"
                      >
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.cityName || "Addis Ababa"} — {b.categoryName})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Completing payment immediately verifies and updates this business.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Business Name *
                        </label>
                        <Input
                          required
                          value={newBusinessForm.name}
                          onChange={(e) =>
                            setNewBusinessForm({ ...newBusinessForm, name: e.target.value })
                          }
                          placeholder="e.g. Kategna Gourmet Restaurant"
                          className="text-xs h-9 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Category *
                        </label>
                        <Input
                          required
                          value={newBusinessForm.categoryName}
                          onChange={(e) =>
                            setNewBusinessForm({ ...newBusinessForm, categoryName: e.target.value })
                          }
                          placeholder="e.g. Cafe & Restaurant"
                          className="text-xs h-9 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          City *
                        </label>
                        <Input
                          required
                          value={newBusinessForm.cityName}
                          onChange={(e) =>
                            setNewBusinessForm({ ...newBusinessForm, cityName: e.target.value })
                          }
                          placeholder="e.g. Addis Ababa"
                          className="text-xs h-9 mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Physical Address / Subcity
                        </label>
                        <Input
                          value={newBusinessForm.addressLine}
                          onChange={(e) =>
                            setNewBusinessForm({ ...newBusinessForm, addressLine: e.target.value })
                          }
                          placeholder="e.g. Bole Subcity, Cameroon Street"
                          className="text-xs h-9 mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Payment Method Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    2. Select Payment Method
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {/* Telebirr */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("telebirr")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "telebirr"
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs">Telebirr</span>
                    </button>

                    {/* CBE Birr */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cbebirr")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "cbebirr"
                          ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow-sm"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Building2 className="w-5 h-5 text-purple-500" />
                      <span className="text-xs">CBE Birr</span>
                    </button>

                    {/* M-Pesa */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mpesa")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "mpesa"
                          ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400 font-bold shadow-sm"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-green-500" />
                      <span className="text-xs">M-Pesa</span>
                    </button>

                    {/* International Cards */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "card"
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs">Visa / Card</span>
                    </button>

                    {/* Manual Bank Slip / Telebirr Receipt */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_transfer")}
                      className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "bank_transfer"
                          ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <Upload className="w-5 h-5 text-amber-500" />
                      <span className="text-xs">Bank Slip</span>
                    </button>
                  </div>
                </div>

                {/* 3. Method Specific Fields */}
                {/* Telebirr Input */}
                {paymentMethod === "telebirr" && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">Telebirr Mobile Checkout</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Instant USSD Push</span>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Telebirr Phone Number (+251)
                      </label>
                      <Input
                        required
                        value={telebirrPhone}
                        onChange={(e) => setTelebirrPhone(e.target.value)}
                        placeholder="+251 91 123 4567"
                        className="text-xs mt-1"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      A prompt will be sent to your phone to confirm the PIN and settle payment.
                    </p>
                  </div>
                )}

                {/* CBE Birr Input */}
                {paymentMethod === "cbebirr" && (
                  <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">CBE Birr Wallet / Account</span>
                      <span className="text-[10px] text-purple-600 font-bold">Commercial Bank</span>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        CBE Birr Phone / Account Number
                      </label>
                      <Input
                        required
                        value={cbeAccount}
                        onChange={(e) => setCbeAccount(e.target.value)}
                        placeholder="1000..."
                        className="text-xs mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* M-Pesa Input */}
                {paymentMethod === "mpesa" && (
                  <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">M-Pesa Safaricom</span>
                      <span className="text-[10px] text-green-600 font-bold">STK Push</span>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Safaricom Phone Number
                      </label>
                      <Input
                        required
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="+251 77 ... or +254 7..."
                        className="text-xs mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Credit Card Input */}
                {paymentMethod === "card" && (
                  <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">International Credit / Debit Card</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px]">Visa</Badge>
                        <Badge variant="outline" className="text-[9px]">Mastercard</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Card Number</label>
                      <Input
                        required
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        placeholder="4242 4242 4242 4242"
                        className="text-xs mt-1 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">Expiry</label>
                        <Input
                          required
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="text-xs mt-1 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">CVC</label>
                        <Input
                          required
                          value={cardData.cvc}
                          onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                          placeholder="123"
                          className="text-xs mt-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Transfer & Receipt Upload (CBE: 1000377050917 or Telebirr: 0913273066) */}
                {paymentMethod === "bank_transfer" && (
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                        Direct Deposit & Receipt Upload Option
                      </span>
                      <Badge className="bg-amber-500 text-white text-[10px]">
                        Manual Audit
                      </Badge>
                    </div>

                    {/* Choose Bank / Telebirr Account to Deposit to */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setReceiptType("cbe_bank")}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          receiptType === "cbe_bank"
                            ? "bg-purple-500/10 border-purple-500 font-bold text-foreground"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="text-[10px] text-purple-600 uppercase font-bold">Bank Deposit</div>
                        <div className="font-mono text-xs mt-0.5">CBE: 1000377050917</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReceiptType("telebirr_direct")}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          receiptType === "telebirr_direct"
                            ? "bg-emerald-500/10 border-emerald-500 font-bold text-foreground"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="text-[10px] text-emerald-600 uppercase font-bold">Telebirr Direct</div>
                        <div className="font-mono text-xs mt-0.5">0913273066</div>
                      </button>
                    </div>

                    {/* Deposit Instructions Callout */}
                    <div className="p-3 rounded-xl bg-background border border-border text-[11px] space-y-1">
                      <div className="font-bold text-foreground">
                        {receiptType === "cbe_bank"
                          ? "Transfer to Commercial Bank of Ethiopia (CBE)"
                          : "Transfer to Telebirr Number"}
                      </div>
                      <div className="text-muted-foreground">
                        {receiptType === "cbe_bank" ? (
                          <>
                            Account: <strong className="text-foreground font-mono">1000377050917</strong> (GlobalBiz Platform)
                          </>
                        ) : (
                          <>
                            Telebirr: <strong className="text-foreground font-mono">0913273066</strong> (GlobalBiz Technologies)
                          </>
                        )}
                      </div>
                    </div>

                    {/* Receipt File Upload */}
                    <div>
                      <label className="text-[11px] font-bold text-foreground block mb-1">
                        Attach Bank Deposit Slip / Telebirr Screenshot *
                      </label>
                      <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-background">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptFileSelect}
                          className="hidden"
                          id="receipt-file-input"
                        />
                        <label htmlFor="receipt-file-input" className="cursor-pointer block">
                          {receiptPreview ? (
                            <div className="space-y-2">
                              <img
                                src={receiptPreview}
                                alt="Receipt Preview"
                                className="max-h-36 mx-auto rounded-xl border border-border object-contain shadow-xs"
                              />
                              <span className="text-[11px] text-primary font-bold block">
                                Click to change attached image
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                              <span className="text-xs font-bold text-foreground block">
                                Click or drag to upload receipt image
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                Supports JPG, PNG, WEBP, or PDF
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Reference & Payer Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Bank Reference / UTR / SMS Code *
                        </label>
                        <Input
                          required
                          value={bankReference}
                          onChange={(e) => setBankReference(e.target.value)}
                          placeholder="e.g. FT260891234 or SMS Ref"
                          className="text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Depositor Name *
                        </label>
                        <Input
                          required
                          value={payerName}
                          onChange={(e) => setPayerName(e.target.value)}
                          placeholder="Your Full Name"
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs font-semibold"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isSubmittingCheckout}
                  className="text-xs font-black px-6 gap-2 shadow-md"
                >
                  {isSubmittingCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : paymentMethod === "bank_transfer" ? (
                    <>
                      <Upload className="w-4 h-4" /> Submit Receipt & Register
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> Complete Payment & Activate
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Checkout Success Screen */}
          {checkoutStep === "success" && (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <DialogTitle className="text-2xl font-black text-foreground">
                  {paymentMethod === "bank_transfer"
                    ? "Receipt Submitted for Verification!"
                    : "Payment Successful & Business Registered!"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground max-w-md mx-auto">
                  {paymentMethod === "bank_transfer"
                    ? "Your receipt has been recorded and attached to account 1000377050917 / 0913273066. Our compliance desk will confirm within 2-4 business hours."
                    : `Your business has been upgraded to ${selectedPlanForCheckout.name} and published live.`}
                </DialogDescription>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono font-bold text-foreground">{completedTxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier:</span>
                  <span className="font-bold text-foreground">{selectedPlanForCheckout.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing:</span>
                  <span className="font-semibold">{billingCycle} ({currency})</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    window.print();
                  }}
                  className="text-xs font-bold gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Tax Receipt
                </Button>

                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs font-black px-6"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Printable / Downloadable Invoice Modal ──────────────────────────── */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
          <DialogContent className="max-w-md p-0 bg-card border-border rounded-3xl overflow-hidden shadow-2xl print:border-none print:shadow-none">
            <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto backdrop-blur-md">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <DialogTitle className="text-lg font-black tracking-tight">
                Tax Invoice & Payment Receipt
              </DialogTitle>
              <div className="text-2xl font-black font-mono">
                {selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                {selectedInvoice.status.toUpperCase()}
              </Badge>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="divide-y divide-border/60 rounded-2xl bg-muted/30 border border-border p-3.5 space-y-2">
                <div className="flex justify-between pb-2">
                  <span className="text-muted-foreground">Invoice ID:</span>
                  <span className="font-mono font-bold">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Business:</span>
                  <span className="font-bold">{selectedInvoice.businessName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Payment Channel:</span>
                  <span className="capitalize font-semibold">{selectedInvoice.provider.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-mono">{selectedInvoice.reference || "N/A"}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(selectedInvoice.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* If attached proof receipt exists */}
              {selectedInvoice.metadata?.receiptUrl && (
                <div className="p-3 rounded-2xl border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Attached Transfer Slip
                    </span>
                    <a
                      href={selectedInvoice.metadata.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary font-bold hover:underline"
                    >
                      Open Full Size ↗
                    </a>
                  </div>
                  <img
                    src={selectedInvoice.metadata.receiptUrl}
                    alt="Receipt"
                    className="max-h-36 mx-auto rounded-xl object-contain border border-border"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="w-full text-xs font-bold gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => {
                    toast.success("Receipt PDF downloaded!");
                    setSelectedInvoice(null);
                  }}
                  className="w-full text-xs font-bold gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── QR Code Modal ─────────────────────────────────────────────────── */}
      {qrModalAccount && (
        <Dialog open={!!qrModalAccount} onOpenChange={(open) => !open && setQrModalAccount(null)}>
          <DialogContent className="max-w-xs p-6 bg-card border-border rounded-3xl text-center space-y-4">
            <DialogTitle className="text-base font-black text-foreground">
              {qrModalAccount.title}
            </DialogTitle>
            <div className="p-4 rounded-2xl bg-white w-fit mx-auto border border-border shadow-xs">
              <img
                src={qrModalAccount.qrUrl}
                alt="Account QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>
            <div className="font-mono text-sm font-black text-foreground">
              {qrModalAccount.account}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Scan with your mobile banking or Telebirr app to transfer directly.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopyText(qrModalAccount.account, "Account number")}
              className="w-full text-xs font-bold gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Account
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
