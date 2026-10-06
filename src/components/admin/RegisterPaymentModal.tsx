"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Building2,
  Receipt,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Smartphone,
  Landmark,
  Banknote,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  IPayment,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PaymentCurrency,
} from "@/types/payment";

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRegistered: (payment: IPayment) => void;
  businessesList?: Array<{ id: string; name: string }>;
  currentAdminName?: string;
}

export function RegisterPaymentModal({
  isOpen,
  onClose,
  onPaymentRegistered,
  businessesList = [],
  currentAdminName = "Super Admin",
}: RegisterPaymentModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [countryName, setCountryName] = useState("Ethiopia");
  const [cityName, setCityName] = useState("Addis Ababa");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [amount, setAmount] = useState<number | string>(1499);
  const [currency, setCurrency] = useState<PaymentCurrency>("ETB");
  const [provider, setProvider] = useState<PaymentProvider>("telebirr");
  const [paymentType, setPaymentType] = useState<PaymentType>("subscription");
  const [status, setStatus] = useState<PaymentStatus>("completed");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset plans quick-fill
  const handleSelectPreset = (
    type: PaymentType,
    amt: number,
    desc: string
  ) => {
    setPaymentType(type);
    setAmount(amt);
    setDescription(desc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      toast.error("Please enter or select a business name.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        businessId: businessId || undefined,
        businessName: businessName.trim(),
        cityName: cityName.trim() || undefined,
        countryName: countryName.trim() || undefined,
        payerName: payerName.trim() || `${businessName} Owner`,
        payerPhone: payerPhone.trim() || undefined,
        payerEmail: payerEmail.trim() || undefined,
        amount: Number(amount),
        currency,
        provider,
        paymentType,
        status,
        reference: reference.trim() || undefined,
        description: description.trim() || undefined,
        registeredBy: currentAdminName,
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to register payment");
      }

      toast.success(
        `Payment ${data.payment.id} registered successfully! (${data.payment.amount} ${data.payment.currency})`
      );
      onPaymentRegistered(data.payment);
      handleResetAndClose();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setBusinessName("");
    setBusinessId("");
    setPayerName("");
    setPayerPhone("");
    setPayerEmail("");
    setAmount(1499);
    setCurrency("ETB");
    setProvider("telebirr");
    setPaymentType("subscription");
    setStatus("completed");
    setReference("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0 bg-card border-border rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground">
                Register Actual Payment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record incoming subscription dues, advertising payments, or manual wire deposits directly to the ledger.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "subscription",
                    1499,
                    "Business Pro Monthly Subscription"
                  )
                }
                className={`p-2.5 rounded-2xl border text-left transition-all text-xs font-semibold ${
                  paymentType === "subscription" && amount === 1499
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="font-bold text-foreground">Pro Tier</div>
                <div className="text-[11px] text-emerald-600 font-bold">1,499 ETB</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "advertisement",
                    3200,
                    "Top Search Sponsored Ad Placement (14 Days)"
                  )
                }
                className={`p-2.5 rounded-2xl border text-left transition-all text-xs font-semibold ${
                  paymentType === "advertisement" && amount === 3200
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="font-bold text-foreground">Ad Campaign</div>
                <div className="text-[11px] text-emerald-600 font-bold">3,200 ETB</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "verification",
                    1500,
                    "Official Business Verification Badge"
                  )
                }
                className={`p-2.5 rounded-2xl border text-left transition-all text-xs font-semibold ${
                  paymentType === "verification" && amount === 1500
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="font-bold text-foreground">Verification</div>
                <div className="text-[11px] text-emerald-600 font-bold">1,500 ETB</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPreset(
                    "featured_listing",
                    5000,
                    "Spotlight Map Pin & Category Priority Placement"
                  )
                }
                className={`p-2.5 rounded-2xl border text-left transition-all text-xs font-semibold ${
                  paymentType === "featured_listing" && amount === 5000
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="font-bold text-foreground">Map Spotlight</div>
                <div className="text-[11px] text-emerald-600 font-bold">5,000 ETB</div>
              </button>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" /> Target Business
            </h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Business Name <span className="text-rose-500">*</span>
              </label>
              {businessesList.length > 0 ? (
                <div className="space-y-2">
                  <input
                    list="business-options"
                    value={businessName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBusinessName(val);
                      const matched = businessesList.find((b) => b.name === val);
                      if (matched) setBusinessId(matched.id);
                    }}
                    placeholder="e.g. Kategna Ethiopian Restaurant"
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <datalist id="business-options">
                    {businessesList.map((b) => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
                </div>
              ) : (
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Kategna Ethiopian Restaurant"
                  className="h-10 text-xs rounded-xl"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Country
                </label>
                <Input
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  placeholder="e.g. Ethiopia"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  City / Municipality
                </label>
                <Input
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="e.g. Addis Ababa"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Payer / Contact Name
                </label>
                <Input
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Kassahun Tadesse"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Phone Number
                </label>
                <Input
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="h-9 text-xs rounded-xl mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Email Address
                </label>
                <Input
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="owner@business.et"
                  className="h-9 text-xs rounded-xl mt-1"
                />
              </div>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-foreground">
                Payment Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1499"
                  className="h-10 text-sm font-black pl-3 pr-16 rounded-xl font-mono"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs font-black text-muted-foreground uppercase">
                  {currency}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as PaymentCurrency)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="ETB">ETB (Ethiopian Birr)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Payment Method / Provider */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              Payment Provider / Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "telebirr", label: "Telebirr", icon: <Smartphone className="w-4 h-4 text-emerald-500" /> },
                { id: "cbebirr", label: "CBE Birr", icon: <Building2 className="w-4 h-4 text-purple-500" /> },
                { id: "mpesa", label: "M-Pesa", icon: <Smartphone className="w-4 h-4 text-green-500" /> },
                { id: "card", label: "Card / Stripe", icon: <CreditCard className="w-4 h-4 text-indigo-500" /> },
                { id: "chapa", label: "Chapa", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
                { id: "bank_transfer", label: "Bank Transfer", icon: <Landmark className="w-4 h-4 text-cyan-500" /> },
                { id: "cash", label: "Cash / Office", icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setProvider(m.id as PaymentProvider)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                    provider === m.id
                      ? "border-primary bg-primary/10 text-foreground font-bold shadow-sm"
                      : "border-border hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Transaction Ref / Deposit Slip #
              </label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. TB-992104 or CBE-SLIP-4412"
                className="h-10 text-xs rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">
                Payment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="completed">Completed (Paid & Settled)</option>
                <option value="pending">Pending (Awaiting Verification)</option>
                <option value="refunded">Refunded</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Description / Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Description / Audit Memo
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Annual subscription for Bole branch with priority search ranking."
              className="text-xs rounded-xl min-h-[65px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetAndClose}
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-black min-w-[140px]"
            >
              {isSubmitting ? "Registering..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
