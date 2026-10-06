"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  Globe,
  Clock,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Business } from "@/types/business";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import { toast } from "sonner";

interface BusinessConfirmationModalProps {
  businessId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BusinessConfirmationModal({
  businessId,
  isOpen,
  onClose,
  onSuccess,
}: BusinessConfirmationModalProps) {
  const { currentRole, currentUser } = useCurrentRole();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [revisionMode, setRevisionMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const isSuperAdmin = currentRole === "super_admin" || currentRole === "admin";
  const isCountryAdmin = currentRole === "country_admin";
  const isCityAdmin = currentRole === "city_admin";

  useEffect(() => {
    if (!isOpen || !businessId) {
      setBusiness(null);
      setNotes("");
      setRejectMode(false);
      setRevisionMode(false);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/businesses/${businessId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.business) {
            setBusiness(data.business);
          }
        }
      } catch (err) {
        console.error("Failed to load business details for confirmation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, businessId]);

  const handleApprovalAction = async (action: string) => {
    if (!business) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/businesses/${business.id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          actorName: currentUser?.name || "Administrator",
          actorRole: currentRole,
          notes: notes.trim() || undefined,
          rejectionReason: rejectionReason.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Confirmation Updated!", {
          description: `Action "${action.replace(/_/g, " ")}" completed successfully for "${business.name}".`,
        });
        onSuccess?.();
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error("Action Failed", {
          description: err.error || "Could not update listing status.",
        });
      }
    } catch (err: any) {
      toast.error("Network Error", {
        description: err.message || "Failed to contact confirmation server.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const approvalStatus = business?.approvalStatus || "pending_city";
  const isCityApproved = Boolean(business?.approvedByCity?.approved);
  const isCountryApproved = Boolean(business?.approvedByCountry?.approved);
  const isSuperApproved = Boolean(business?.approvedBySuperAdmin?.approved || business?.isApproved);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-y-auto rounded-3xl bg-background border border-border/80 shadow-2xl">
        <DialogHeader className="p-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Listing Confirmation & Verification</span>
                  {approvalStatus === "approved" && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold">
                      Live & Published
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Multi-tier confirmation inspection: City Admin &rarr; Country Lead &rarr; Super Admin
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
              Role: <span className="font-bold text-primary ml-1 capitalize">{currentRole.replace("_", " ")}</span>
            </Badge>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Fetching listing verification files...</p>
          </div>
        ) : !business ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-sm font-semibold">Business not found or already verified.</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* ── 3-STAGE MULTI-TIER PIPELINE VISUALIZER ── */}
            <div className="p-4 rounded-2xl border border-border/80 bg-muted/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Multi-Tier Confirmation Pipeline
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Stage 1: City Admin */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isCityApproved
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : approvalStatus === "pending_city"
                      ? "border-sky-500/50 bg-sky-500/10 shadow-sm"
                      : "border-border/60 bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">Stage 1: City Admin</span>
                    {isCityApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {business.cityName || "Municipal"} Local Check
                  </p>
                  <div className="mt-2 text-[10px] font-semibold">
                    {isCityApproved ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓ Verified by City</span>
                    ) : (
                      <span className="text-sky-600 dark:text-sky-400">Awaiting City Review</span>
                    )}
                  </div>
                </div>

                {/* Stage 2: Country Admin */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isCountryApproved
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : approvalStatus === "pending_country"
                      ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm"
                      : "border-border/60 bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">Stage 2: Country Lead</span>
                    {isCountryApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {business.countryName || "National"} Directory Check
                  </p>
                  <div className="mt-2 text-[10px] font-semibold">
                    {isCountryApproved ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓ Country Approved</span>
                    ) : isCityApproved ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">Ready for Review</span>
                    ) : (
                      <span className="text-muted-foreground">Pending Stage 1</span>
                    )}
                  </div>
                </div>

                {/* Stage 3: Super Admin */}
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isSuperApproved
                      ? "border-purple-500/50 bg-purple-500/10 shadow-sm"
                      : approvalStatus === "pending_super_admin"
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-border/60 bg-background/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-foreground">Stage 3: Super Admin</span>
                    {isSuperApproved ? (
                      <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Global Live Posting</p>
                  <div className="mt-2 text-[10px] font-semibold">
                    {isSuperApproved ? (
                      <span className="text-purple-600 dark:text-purple-400 font-bold">✓ Live Everywhere</span>
                    ) : isCountryApproved ? (
                      <span className="text-purple-600 dark:text-purple-400 font-bold">Ready for Sign-off</span>
                    ) : (
                      <span className="text-muted-foreground">Fast-Track Available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── BUSINESS SUMMARY CARD ── */}
            <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <span>{business.name}</span>
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {business.categoryName}
                    </Badge>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{business.addressLine || `${business.cityName}, ${business.countryName}`}</span>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                    {business.priceTier || "$$"} • {business.businessType || "Business"}
                  </Badge>
                </div>
              </div>

              {business.description && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 bg-muted/40 p-3 rounded-xl border border-border/40">
                  {business.description}
                </p>
              )}

              {/* Submitter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Submitter ID:</span>
                  <span className="font-mono text-foreground font-semibold truncate max-w-[180px]">
                    {business.ownerId || "Unknown user"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground sm:justify-end">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Created:</span>
                  <span className="text-foreground font-medium">
                    {new Date(business.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ── NOTES / AUDIT COMMENT BOX ── */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Confirmation Audit Notes:</span>
                <span className="text-[10px] text-muted-foreground font-normal">(Visible in audit log)</span>
              </label>
              <Textarea
                placeholder="Add verification notes, permit checks, or instructions for this listing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs rounded-xl"
              />
            </div>

            {/* ── REJECTION / REVISION PANEL ── */}
            {rejectMode && (
              <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-2">
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Specify Rejection Reason
                </div>
                <Textarea
                  placeholder="Provide precise reason for rejecting this listing (will be notified to user)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="text-xs rounded-xl border-rose-500/40"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setRejectMode(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isProcessing || !rejectionReason.trim()}
                    onClick={() => handleApprovalAction("reject")}
                    className="text-xs font-bold"
                  >
                    Confirm Rejection
                  </Button>
                </div>
              </div>
            )}

            {revisionMode && (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Request Revisions from Submitter
                </div>
                <Textarea
                  placeholder="Explain what needs correction (e.g. clearer photo, valid municipal license, precise pin)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="text-xs rounded-xl border-amber-500/40"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setRevisionMode(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isProcessing || !rejectionReason.trim()}
                    onClick={() => handleApprovalAction("request_revision")}
                    className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Send Revision Request
                  </Button>
                </div>
              </div>
            )}

            {/* ── ACTION BUTTON CONTROLS ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {!rejectMode && !revisionMode && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRevisionMode(true)}
                      className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    >
                      Request Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectMode(true)}
                      className="text-xs border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
                  Close
                </Button>

                {/* City Admin Action */}
                {isCityAdmin && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isProcessing || isCityApproved}
                    onClick={() => handleApprovalAction("city_approve")}
                    className="font-bold text-xs gap-1.5 bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCityApproved ? "City Already Verified" : "Confirm City Approval"}
                  </Button>
                )}

                {/* Country Admin Action */}
                {isCountryAdmin && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isProcessing || isCountryApproved}
                    onClick={() => handleApprovalAction("country_approve")}
                    className="font-bold text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCountryApproved ? "Country Already Verified" : "Confirm Country Approval"}
                  </Button>
                )}

                {/* Super Admin Actions */}
                {isSuperAdmin && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing || isSuperApproved}
                      onClick={() => handleApprovalAction("super_admin_override")}
                      className="font-bold text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                      title="Directly bypass earlier approval stages and publish immediately"
                    >
                      <Zap className="w-4 h-4" />
                      ⚡ Fast-Track & Publish
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={isProcessing || isSuperApproved}
                      onClick={() => handleApprovalAction("super_admin_approve")}
                      className="font-bold text-xs gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isSuperApproved ? "Listing is Live" : "Final Super Admin Approval"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
