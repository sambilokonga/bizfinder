"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Crown,
  Globe,
  MapPin,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  User as UserIcon,
  LogOut,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Building2,
  Megaphone,
  KeyRound,
  Compass,
  X,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserRole } from "@/types/user";

export interface AdminProfileHeaderChipProps {
  currentRole: UserRole | string;
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
    assignedCountry?: string;
    assignedCity?: string;
  } | null;
  assignedCountry?: string;
  assignedCity?: string;
  onOpenBroadcast?: () => void;
  className?: string;
}

export function AdminProfileHeaderChip({
  currentRole,
  currentUser,
  assignedCountry = "Ethiopia",
  assignedCity = "Addis Ababa",
  onOpenBroadcast,
  className = "",
}: AdminProfileHeaderChipProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Determine display name — prioritize real logged in Clerk user name, fallback to currentUser, then default
  const displayName =
    (user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim()) ||
    currentUser?.name ||
    user?.username ||
    "Admin User";

  // Email
  const displayEmail =
    user?.emailAddresses?.[0]?.emailAddress ||
    currentUser?.email ||
    "admin@bizfinder.et";

  // Avatar URL — use provided avatarUrl, user imageUrl, or generate deterministic avatar
  const avatarUrl =
    currentUser?.avatarUrl ||
    user?.imageUrl ||
    `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Single or double letter initials for avatar fallback
  const initials = displayName
    ? displayName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : "AD";

  // First letter lowercase/uppercase for avatar matching user's screenshot
  const singleInitial = displayName ? displayName.charAt(0) : "A";

  // Role subtitle & theme styling
  const isSuper = currentRole === "super_admin";
  const isCountry = currentRole === "country_admin";
  const isCity = currentRole === "city_admin";
  const isOps = currentRole === "admin";

  const roleTitle = isSuper
    ? "Super Admin Lead"
    : isCountry
    ? "National Lead"
    : isCity
    ? "Municipal Lead"
    : isOps
    ? "Operations Lead"
    : "Administrator";

  const roleBadgeText = isSuper
    ? "👑 Global Super Admin"
    : isCountry
    ? `🌍 National Lead (${assignedCountry})`
    : isCity
    ? `🏙️ Municipal Lead (${assignedCity})`
    : "🛡️ Platform Operations";

  const roleThemeGradient = isSuper
    ? "from-purple-600 via-indigo-600 to-amber-500"
    : isCountry
    ? "from-indigo-600 via-blue-600 to-sky-500"
    : isCity
    ? "from-sky-500 via-indigo-600 to-violet-600"
    : "from-emerald-600 via-teal-600 to-indigo-600";

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* ─── Profile Trigger Chip (Matching City Admin Header) ───────── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 pl-2 border-l border-border hover:bg-accent/50 p-1.5 rounded-2xl transition-all cursor-pointer text-left group shrink-0 whitespace-nowrap ${className}`}
        title={`View Profile: ${displayName} (${roleTitle})`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-indigo-500/30 group-hover:ring-indigo-500/60 transition-all shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-sm ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all shrink-0">
            {singleInitial}
          </div>
        )}

        <div className="text-left hidden lg:block leading-tight shrink-0 whitespace-nowrap">
          <div className="text-xs font-bold leading-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap">
            <span className="truncate max-w-[120px] xl:max-w-[160px] whitespace-nowrap">{displayName}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          <div className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">{roleTitle}</div>
        </div>
      </button>

      {/* ─── Functional Admin Profile Dossier Modal ─────────────────── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="w-[94vw] max-w-md sm:max-w-lg max-h-[92dvh] sm:max-h-[88dvh] flex flex-col gap-0 rounded-2xl sm:rounded-3xl p-0 overflow-hidden border border-border shadow-2xl bg-card my-auto"
          hideCloseButton
        >
          {/* Header Banner */}
          <div className={`p-4 xs:p-5 sm:p-7 pt-5 xs:pt-6 sm:pt-7 bg-gradient-to-r ${roleThemeGradient} text-white relative overflow-hidden shrink-0`}>
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top-Right Dedicated Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 xs:top-4 xs:right-4 sm:top-6 sm:right-6 z-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white border border-white/30 flex items-center justify-center transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md"
              title="Close Profile"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>

            <div className="relative z-10 flex items-center gap-3 xs:gap-3.5 sm:gap-4 pr-10 xs:pr-12 sm:pr-14">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-2 xs:ring-3 sm:ring-4 ring-white/30 shadow-xl shrink-0"
                />
              ) : (
                <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl xs:text-2xl font-black ring-2 xs:ring-3 sm:ring-4 ring-white/30 shadow-xl shrink-0">
                  {singleInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 xs:gap-2 flex-wrap">
                  <DialogTitle className="text-base xs:text-lg sm:text-xl font-black tracking-tight text-white truncate max-w-[170px] xs:max-w-[220px] sm:max-w-none">
                    {displayName}
                  </DialogTitle>
                  <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-emerald-300 shrink-0" />
                </div>
                <DialogDescription className="text-[11px] xs:text-xs text-white/85 font-medium truncate mt-0.5">
                  {displayEmail}
                </DialogDescription>
                <div className="mt-1.5 xs:mt-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Badge className="bg-white/20 hover:bg-white/25 text-white border-white/30 text-[9px] xs:text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
                    {roleBadgeText}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[9px] xs:text-[10px] text-emerald-200 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Session
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content - Scrollable on small screens */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 xs:p-4.5 sm:p-6 space-y-3 sm:space-y-4 text-xs">
            {/* Identity & Workstation Info */}
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:gap-2.5">
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Jurisdiction Scope
                </span>
                <span
                  className="font-bold text-foreground text-xs mt-1 flex items-center gap-1.5 min-w-0"
                  title={isCountry ? `${assignedCountry} (National)` : isCity ? `${assignedCity} (Municipal)` : isSuper ? "195 Nations (Global)" : "Worldwide Operations"}
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">
                    {isCountry ? `${assignedCountry} (National)` : isCity ? `${assignedCity} (Municipal)` : isSuper ? "195 Nations (Global)" : "Worldwide Operations"}
                  </span>
                </span>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Security Provider
                </span>
                <span className="font-bold text-foreground text-xs mt-1 flex items-center gap-1.5 min-w-0" title="Clerk Verified Token">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">Clerk Verified Token</span>
                </span>
              </div>
            </div>

            {/* User ID copy row */}
            {user?.id && (
              <div className="flex items-center justify-between p-2 xs:p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px] gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-[9px] xs:text-[10px] font-bold uppercase text-muted-foreground shrink-0">
                    ID:
                  </span>
                  <span className="text-muted-foreground font-mono truncate text-[10px] xs:text-[11px]" title={user.id}>
                    {user.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(user.id, "User ID")}
                  className="px-2 py-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center gap-1 text-[10px] font-semibold active:scale-95"
                  title="Copy User ID"
                  aria-label="Copy User ID"
                >
                  {copiedField === "User ID" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-emerald-500 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden xs:inline text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Delegated Authorities for Role */}
            <div className="space-y-2 p-3 xs:p-3.5 sm:p-4 rounded-2xl bg-muted/20 border border-border/60">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-[11px] font-bold text-foreground">
                <span className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="truncate">Delegated Administrative Authority</span>
                </span>
                <span className="text-[9px] xs:text-[10px] text-muted-foreground font-medium self-start xs:self-auto bg-muted/60 px-1.5 py-0.5 rounded shrink-0">
                  Active Role Level
                </span>
              </div>
              <ul className="space-y-2 text-[11px] text-muted-foreground pt-1">
                {isCountry && (
                  <>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Appoint and oversee City Admins across 30 municipal districts</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Direct national business directory verification & escalation</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Real-time international visitor telemetry for {assignedCountry}</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Issue nationwide commercial and regulatory broadcasts</span>
                    </li>
                  </>
                )}
                {isOps && (
                  <>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Worldwide listing verification queue & storefront certification</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Citizen dispute resolution, customer claims & review moderation</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Directory health monitoring, analytics & international visitors</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Category taxonomy moderation & business compliance</span>
                    </li>
                  </>
                )}
                {isSuper && (
                  <>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Worldwide master control across all 195 sovereign territories</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Direct Clerk publicMetadata role synchronization & account governance</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Security policy, IP blacklisting, database & audit logs</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Platform billing, subscriptions & revenue infrastructure</span>
                    </li>
                  </>
                )}
                {isCity && (
                  <>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Municipal business verification & map pin location certification</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Trade license compliance audit & ownership claim approvals</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">Sub-city commercial corridor management & district notices</span>
                    </li>
                    <li className="flex items-start gap-2 text-foreground/90 font-medium leading-snug">
                      <span className="text-emerald-500 font-bold shrink-0 mt-0.5 text-xs">✓</span>
                      <span className="flex-1">International visitor engagement monitoring for {assignedCity}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Quick Actions Footer - Pinned/Sticky at Bottom */}
          <div className="p-3 xs:p-3.5 sm:p-4 border-t border-border/60 bg-card shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
            {/* Quick Action Links: Broadcast Notice & Account Settings */}
            <div className="grid grid-cols-1 min-[340px]:grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              {onOpenBroadcast && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenBroadcast();
                  }}
                  className="gap-1.5 text-xs font-semibold w-full sm:w-auto h-8.5 sm:h-8 justify-center shadow-xs"
                >
                  <Megaphone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="truncate">Broadcast Notice</span>
                </Button>
              )}
              <Link href="/profile" className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold w-full sm:w-auto h-8.5 sm:h-8 justify-center shadow-xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">Account Settings</span>
                </Button>
              </Link>
            </div>

            {/* System Actions: Sign Out & Close Dialog */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8.5 sm:h-8 px-2.5"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Out</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold px-5 h-8.5 sm:h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
