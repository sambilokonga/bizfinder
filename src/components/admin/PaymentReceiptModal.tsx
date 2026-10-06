"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { IPayment, PaymentStatus } from "@/types/payment";

interface PaymentReceiptModalProps {
  payment: IPayment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (id: string, newStatus: PaymentStatus) => void;
}

export function PaymentReceiptModal({
  payment,
  isOpen,
  onClose,
  onStatusUpdated,
}: PaymentReceiptModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!payment) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (newStatus: PaymentStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update payment status");
      }

      toast.success(`Payment marked as ${newStatus}!`);
      if (onStatusUpdated) {
        onStatusUpdated(payment.id, newStatus);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "telebirr":
        return <Smartphone className="w-4 h-4 text-emerald-500" />;
      case "cbebirr":
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case "mpesa":
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case "card":
        return <CreditCard className="w-4 h-4 text-indigo-500" />;
      case "chapa":
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      case "bank_transfer":
        return <Landmark className="w-4 h-4 text-cyan-500" />;
      case "cash":
        return <Banknote className="w-4 h-4 text-emerald-600" />;
      default:
        return <Receipt className="w-4 h-4 text-primary" />;
    }
  };

  const formattedDate = payment.createdAt
    ? new Date(payment.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 bg-card border-border rounded-3xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:border-none">
        {/* Receipt Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white text-center space-y-2 relative">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto backdrop-blur-md">
            <Receipt className="w-6 h-6 text-emerald-400" />
          </div>

          <DialogTitle className="text-lg font-black tracking-tight">
            Payment Receipt & Tax Invoice
          </DialogTitle>
          <p className="text-[11px] text-slate-300 font-medium">
            BizFinder Global Business Directory & Advertising Ledger
          </p>

          <div className="pt-2">
            <div className="text-3xl font-black text-white font-mono tracking-tight">
              {payment.amount.toLocaleString()}{" "}
              <span className="text-sm font-bold text-emerald-400">
                {payment.currency}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge
                className={
                  payment.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]"
                    : payment.status === "pending"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]"
                    : payment.status === "refunded"
                    ? "bg-slate-500/20 text-slate-300 border-slate-500/40 text-[10px]"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]"
                }
              >
                {payment.status.toUpperCase()}
              </Badge>
              <span className="text-[11px] text-slate-400 font-mono">
                {payment.id}
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="divide-y divide-border/60 rounded-2xl bg-muted/30 border border-border p-3.5 space-y-2 text-foreground">
            <div className="flex items-center justify-between pb-2">
              <span className="text-muted-foreground font-medium">Business:</span>
              <span className="font-black text-right">{payment.businessName}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-medium">Payer:</span>
              <span className="font-semibold">{payment.payerName}</span>
            </div>

            {payment.payerPhone && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground font-medium">Phone:</span>
                <span className="font-mono text-muted-foreground">{payment.payerPhone}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-medium">Payment Purpose:</span>
              <span className="font-bold text-primary uppercase text-[11px]">
                {payment.paymentType.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground font-medium">Payment Channel:</span>
              <div className="flex items-center gap-1.5 font-bold capitalize">
                {getProviderIcon(payment.provider)}
                <span>{payment.provider.replace("_", " ")}</span>
              </div>
            </div>

            {payment.reference && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground font-medium">Auth Reference:</span>
                <div className="flex items-center gap-1 font-mono font-bold">
                  <span>{payment.reference}</span>
                  <button
                    onClick={() => handleCopy(payment.reference!, "Reference")}
                    className="p-1 hover:bg-accent rounded text-muted-foreground"
                    title="Copy reference"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground font-medium">Date & Time:</span>
              <span className="text-muted-foreground">{formattedDate}</span>
            </div>
          </div>

          {/* Deposit Account & Attached Receipt Verification Preview */}
          {(payment.metadata?.depositedAccount || payment.metadata?.receiptUrl || payment.provider === "bank_transfer") && (
            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Direct Transfer Audit Details
                </span>
                <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400">
                  {payment.metadata?.transferType === "telebirr_direct" ? "Telebirr Transfer" : "CBE Bank Transfer"}
                </Badge>
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Target Official Account:</span>
                  <strong className="text-foreground font-mono">
                    {payment.metadata?.depositedAccount || (payment.provider === "telebirr" ? "0913273066" : "1000377050917")}
                  </strong>
                </div>
                {payment.metadata?.bankReference && (
                  <div className="flex justify-between">
                    <span>Slip / UTR Reference:</span>
                    <strong className="text-foreground font-mono">{payment.metadata.bankReference}</strong>
                  </div>
                )}
              </div>

              {payment.metadata?.receiptUrl && (
                <div className="pt-2 border-t border-amber-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Uploaded Proof Receipt:</span>
                    <a
                      href={payment.metadata.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Open Full Size ↗
                    </a>
                  </div>
                  <a
                    href={payment.metadata.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl overflow-hidden border border-border/80 hover:opacity-90 transition-opacity bg-black/5 dark:bg-black/20"
                  >
                    <img
                      src={payment.metadata.receiptUrl}
                      alt="Bank Transfer Receipt"
                      className="w-full max-h-48 object-contain"
                    />
                  </a>
                </div>
              )}
            </div>
          )}

          {payment.description && (
            <div className="p-3 rounded-xl bg-background border border-border text-muted-foreground text-[11px]">
              <strong className="text-foreground">Memo: </strong>
              {payment.description}
            </div>
          )}

          {/* Status quick actions */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
            <span>Recorded by: <strong>{payment.registeredBy || "Admin"}</strong></span>
            {payment.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("completed")}
                className="h-6 text-[10px] text-emerald-600 border-emerald-500/30 font-bold"
              >
                Approve & Mark Paid
              </Button>
            )}
            {payment.status === "completed" && (
              <Button
                size="sm"
                variant="outline"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("refunded")}
                className="h-6 text-[10px] text-slate-500 hover:text-rose-600 font-semibold"
              >
                Issue Refund
              </Button>
            )}
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-2 border-t border-border flex items-center justify-between gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(payment.id, "Transaction ID")}
              className="text-xs font-semibold"
            >
              <Copy className="w-3.5 h-3.5 mr-1" /> Copy ID
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5 mr-1" /> Print
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={onClose}
                className="text-xs font-bold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
