"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  Receipt,
  Download,
  Building2,
  Lock,
} from "lucide-react";

export type PaymentProvider = "telebirr" | "cbebirr" | "mpesa" | "card";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amountUSD: number;
  amountETB: number;
  billingCycle: "monthly" | "yearly";
  onSuccess: (txId: string) => void;
  businessName?: string;
  businessId?: string;
}

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  planName,
  amountUSD,
  amountETB,
  billingCycle,
  onSuccess,
  businessName = "Kategna Ethiopian Restaurant",
  businessId = "biz-1",
}: PaymentCheckoutModalProps) {
  const [provider, setProvider] = useState<PaymentProvider>("telebirr");
  const [phoneNumber, setPhoneNumber] = useState("+251 91 123 4567");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("842");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const providerPrefix =
      provider === "telebirr"
        ? "TEL"
        : provider === "cbebirr"
        ? "CBE"
        : provider === "mpesa"
        ? "MPE"
        : "STR";
    const generatedTxId = `TX-${providerPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generatedTxId,
          businessId,
          businessName,
          payerName: "Business Owner",
          payerPhone: phoneNumber,
          amount: amountETB,
          currency: "ETB",
          provider,
          paymentType: planName.toLowerCase().includes("campaign")
            ? "advertisement"
            : "subscription",
          status: "completed",
          reference: `${providerPrefix}-REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
          description: `${planName} (${billingCycle})`,
          registeredBy: "Checkout Gateway",
        }),
      });
    } catch (err) {
      console.warn("[Checkout] Background registration notice:", err);
    }

    setTransactionId(generatedTxId);
    setIsProcessing(false);
    setIsSuccess(true);
    onSuccess(generatedTxId);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 bg-card border-border rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
              Secure Checkout
            </Badge>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
              <Lock className="w-3 h-3 text-emerald-500" /> 256-bit Encrypted
            </div>
          </div>

          <DialogTitle className="text-lg font-black text-foreground mt-2">
            Upgrade to {planName}
          </DialogTitle>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-foreground">
              {amountETB.toLocaleString()} ETB
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              (${amountUSD} USD) / {billingCycle === "monthly" ? "month" : "year"}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-foreground">
                  Payment Successful!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Your business has been upgraded to <strong className="text-foreground">{planName}</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-border w-fit mx-auto font-mono text-xs font-bold text-primary mt-2">
                  Ref: {transactionId}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClose} className="font-bold text-xs">
                  <Receipt className="w-3.5 h-3.5 mr-1" /> View Receipt
                </Button>
                <Button variant="gradient" size="sm" onClick={handleClose} className="font-bold text-xs">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4 text-xs">
              {/* Provider Selection */}
              <div>
                <label className="font-bold text-foreground block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Telebirr */}
                  <button
                    type="button"
                    onClick={() => setProvider("telebirr")}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      provider === "telebirr"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900 hover:border-primary/40"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                      T
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Telebirr</div>
                      <div className="text-[10px] text-muted-foreground">Ethio Telecom</div>
                    </div>
                  </button>

                  {/* CBE Birr */}
                  <button
                    type="button"
                    onClick={() => setProvider("cbebirr")}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      provider === "cbebirr"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900 hover:border-primary/40"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      C
                    </div>
                    <div>
                      <div className="font-bold text-foreground">CBE Birr</div>
                      <div className="text-[10px] text-muted-foreground">Commercial Bank</div>
                    </div>
                  </button>

                  {/* M-Pesa */}
                  <button
                    type="button"
                    onClick={() => setProvider("mpesa")}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      provider === "mpesa"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900 hover:border-primary/40"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-foreground">M-Pesa</div>
                      <div className="text-[10px] text-muted-foreground">Safaricom STK</div>
                    </div>
                  </button>

                  {/* Credit Card / Stripe */}
                  <button
                    type="button"
                    onClick={() => setProvider("card")}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      provider === "card"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                        : "border-border bg-slate-50 dark:bg-slate-900 hover:border-primary/40"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">Debit / Card</div>
                      <div className="text-[10px] text-muted-foreground">Visa, Mastercard</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Provider Inputs */}
              {(provider === "telebirr" || provider === "cbebirr" || provider === "mpesa") && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border">
                  <label className="font-bold text-foreground block">
                    {provider === "telebirr"
                      ? "Telebirr Mobile Number"
                      : provider === "cbebirr"
                      ? "CBE Account / Mobile Number"
                      : "Safaricom M-Pesa Number"}
                  </label>
                  <Input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+251 91 123 4567"
                    className="text-xs font-mono bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-primary" />
                    You will receive an instant payment authorization prompt on your phone.
                  </p>
                </div>
              )}

              {provider === "card" && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border">
                  <div>
                    <label className="font-bold text-foreground block mb-1">
                      Card Number
                    </label>
                    <Input
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="text-xs font-mono bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-foreground block mb-1">
                        Expiry Date
                      </label>
                      <Input
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="text-xs font-mono bg-background"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-foreground block mb-1">
                        Security Code (CVC)
                      </label>
                      <Input
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        className="text-xs font-mono bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  disabled={isProcessing}
                  className="font-bold gap-1.5 shadow-md shadow-indigo-500/10 flex-1"
                >
                  {isProcessing ? (
                    "Processing Payment..."
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" /> Pay {amountETB.toLocaleString()} ETB Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
