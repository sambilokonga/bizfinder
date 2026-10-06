"use client";

import React, { useMemo } from "react";
import {
  MapPin,
  Globe,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Smartphone,
  Landmark,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IPayment, GeoPaymentSummary, PaymentStatus } from "@/types/payment";
import { exportPaymentsToCSV, exportPaymentsToJSON } from "@/lib/utils/export-payments";
import { toast } from "sonner";

interface PaymentStatusGeoMatrixProps {
  payments: IPayment[];
  geoSummaries?: GeoPaymentSummary[];
  selectedCountry: string;
  selectedCity: string;
  selectedStatus: string;
  onSelectGeo: (country: string, city: string) => void;
  onSelectStatus: (status: string) => void;
  currentRole?: string;
  title?: string;
  subtitle?: string;
  isCountryLocked?: boolean;
  isCityLocked?: boolean;
}

export function PaymentStatusGeoMatrix({
  payments,
  geoSummaries,
  selectedCountry,
  selectedCity,
  selectedStatus,
  onSelectGeo,
  onSelectStatus,
  currentRole = "super_admin",
  title = "Payment Status by City & Country",
  subtitle = "Live breakdown of transaction statuses, settlement rates, and collections across jurisdictions",
  isCountryLocked = false,
  isCityLocked = false,
}: PaymentStatusGeoMatrixProps) {
  // Compute local geo breakdown if not provided by server
  const computedGeoBreakdown = useMemo(() => {
    if (geoSummaries && geoSummaries.length > 0) return geoSummaries;

    const map = new Map<string, GeoPaymentSummary>();
    payments.forEach((p) => {
      const country = p.countryName || "Ethiopia";
      const city = p.cityName || "Addis Ababa";
      const key = `${country}:::${city}`;

      let item = map.get(key);
      if (!item) {
        item = {
          country,
          city,
          totalAmount: 0,
          currency: p.currency || "ETB",
          count: 0,
          completedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          refundedCount: 0,
        };
        map.set(key, item);
      }

      item.count++;
      if (p.status === "completed") {
        item.completedCount++;
        item.totalAmount += p.amount;
      } else if (p.status === "pending") {
        item.pendingCount++;
      } else if (p.status === "failed") {
        item.failedCount++;
      } else if (p.status === "refunded") {
        item.refundedCount++;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [payments, geoSummaries]);

  // Overall totals across the displayed set
  const totals = useMemo(() => {
    let completedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let refundedCount = 0;
    let totalETB = 0;
    let totalUSD = 0;

    payments.forEach((p) => {
      if (p.status === "completed") {
        completedCount++;
        if (p.currency === "USD") totalUSD += p.amount;
        else totalETB += p.amount;
      } else if (p.status === "pending") {
        pendingCount++;
      } else if (p.status === "failed") {
        failedCount++;
      } else if (p.status === "refunded") {
        refundedCount++;
      }
    });

    const totalCount = payments.length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      completedCount,
      pendingCount,
      failedCount,
      refundedCount,
      totalCount,
      completionRate,
      totalETB,
      totalUSD,
    };
  }, [payments]);

  const handleExportCSV = () => {
    if (!payments.length) {
      toast.error("No payment records to export.");
      return;
    }
    const prefix = `payments_${selectedCountry !== "all" ? selectedCountry.toLowerCase().replace(/\s+/g, "_") : "global"}_${selectedCity !== "all" ? selectedCity.toLowerCase().replace(/\s+/g, "_") : "all_cities"}`;
    exportPaymentsToCSV(payments, prefix);
    toast.success(`Exported ${payments.length} payment records to CSV.`);
  };

  const handleExportJSON = () => {
    if (!payments.length) {
      toast.error("No payment records to export.");
      return;
    }
    const prefix = `payments_${selectedCountry !== "all" ? selectedCountry.toLowerCase().replace(/\s+/g, "_") : "global"}`;
    exportPaymentsToJSON(payments, prefix);
    toast.success(`Exported ${payments.length} payment records to JSON.`);
  };

  return (
    <div className="space-y-4">
      {/* Header and Quick Download Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-card via-card/90 to-primary/5 border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {title}
            </h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
              Live Matrix
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs font-bold gap-1.5 h-9 rounded-2xl border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Report
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            className="text-xs font-bold gap-1.5 h-9 rounded-2xl border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/10 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Status Breakdown KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Completed */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === "completed" ? "all" : "completed")}
          className={`p-4 rounded-3xl text-left border transition-all ${
            selectedStatus === "completed"
              ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
              : "bg-card border-border hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-none text-[10px] font-mono font-bold">
              {totals.completionRate}%
            </Badge>
          </div>
          <div className="text-2xl font-black text-foreground mt-2 font-mono">
            {totals.completedCount}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totals.totalETB.toLocaleString()} ETB {totals.totalUSD > 0 && `+ $${totals.totalUSD}`}
          </div>
        </button>

        {/* Pending */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === "pending" ? "all" : "pending")}
          className={`p-4 rounded-3xl text-left border transition-all ${
            selectedStatus === "pending"
              ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20 shadow-md"
              : "bg-card border-border hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending Queue
            </span>
            {totals.pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-black text-foreground mt-2 font-mono">
            {totals.pendingCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Awaiting bank/gateway confirmation
          </div>
        </button>

        {/* Failed */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === "failed" ? "all" : "failed")}
          className={`p-4 rounded-3xl text-left border transition-all ${
            selectedStatus === "failed"
              ? "bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/20 shadow-md"
              : "bg-card border-border hover:border-rose-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Failed
            </span>
          </div>
          <div className="text-2xl font-black text-foreground mt-2 font-mono">
            {totals.failedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Card declines or expired sessions
          </div>
        </button>

        {/* Refunded */}
        <button
          type="button"
          onClick={() => onSelectStatus(selectedStatus === "refunded" ? "all" : "refunded")}
          className={`p-4 rounded-3xl text-left border transition-all ${
            selectedStatus === "refunded"
              ? "bg-slate-500/15 border-slate-500 ring-2 ring-slate-500/20 shadow-md"
              : "bg-card border-border hover:border-slate-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Refunded
            </span>
          </div>
          <div className="text-2xl font-black text-foreground mt-2 font-mono">
            {totals.refundedCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
            Returned / reversed orders
          </div>
        </button>
      </div>

      {/* Geographic Breakdown Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Cities & Countries Performance Matrix
          </span>
          <span className="text-[11px] text-muted-foreground">
            Click any city card below to quick-filter transactions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {computedGeoBreakdown.map((geo) => {
            const isSelected =
              (selectedCountry === "all" || selectedCountry.toLowerCase() === geo.country.toLowerCase()) &&
              (selectedCity === "all" || selectedCity.toLowerCase() === geo.city.toLowerCase());

            const completedRate = geo.count > 0 ? Math.round((geo.completedCount / geo.count) * 100) : 0;
            const pendingRate = geo.count > 0 ? Math.round((geo.pendingCount / geo.count) * 100) : 0;
            const failedRate = geo.count > 0 ? Math.round(((geo.failedCount + geo.refundedCount) / geo.count) * 100) : 0;

            return (
              <div
                key={`${geo.country}-${geo.city}`}
                onClick={() => {
                  if (isSelected && selectedCity !== "all") {
                    onSelectGeo("all", "all");
                  } else {
                    onSelectGeo(geo.country, geo.city);
                  }
                }}
                className={`group p-4 rounded-3xl border text-left cursor-pointer transition-all hover:shadow-md ${
                  isSelected && (selectedCity !== "all" || selectedCountry !== "all")
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20 shadow-sm"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {/* Header: City, Country, & Volume */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                        {geo.city}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        · {geo.country}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {geo.count} {geo.count === 1 ? "transaction" : "transactions"} logged
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {geo.totalAmount.toLocaleString()} {geo.currency}
                    </div>
                    <Badge variant="outline" className="mt-0.5 text-[9px] font-bold border-border bg-background">
                      {completedRate}% Settled
                    </Badge>
                  </div>
                </div>

                {/* Progress bar visual for Status distribution */}
                <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden flex mt-3">
                  <div
                    style={{ width: `${completedRate}%` }}
                    className="h-full bg-emerald-500 transition-all"
                    title={`Completed: ${geo.completedCount} (${completedRate}%)`}
                  />
                  <div
                    style={{ width: `${pendingRate}%` }}
                    className="h-full bg-amber-500 transition-all"
                    title={`Pending: ${geo.pendingCount} (${pendingRate}%)`}
                  />
                  <div
                    style={{ width: `${failedRate}%` }}
                    className="h-full bg-rose-500 transition-all"
                    title={`Failed/Refunded: ${geo.failedCount + geo.refundedCount} (${failedRate}%)`}
                  />
                </div>

                {/* Status Badges Row */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-[10px] font-bold">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {geo.completedCount} Paid
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {geo.pendingCount} Pending
                  </span>
                  {(geo.failedCount > 0 || geo.refundedCount > 0) && (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {geo.failedCount + geo.refundedCount} Issues
                    </span>
                  )}
                  <span className="text-primary group-hover:underline ml-auto flex items-center gap-0.5 text-[10px]">
                    Filter →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
