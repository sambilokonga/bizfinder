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

  // Avatar URL
  const avatarUrl = user?.imageUrl || currentUser?.avatarUrl;

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
        <DialogContent className="max-w-md sm:max-w-lg rounded-3xl p-0 overflow-hidden border border-border shadow-2xl bg-card">
          {/* Header Banner */}
          <div className={`p-6 bg-gradient-to-r ${roleThemeGradient} text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl font-black ring-4 ring-white/30 shadow-xl">
                  {singleInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-lg font-black tracking-tight text-white truncate">
                    {displayName}
                  </DialogTitle>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                </div>
                <DialogDescription className="text-xs text-white/80 font-medium truncate mt-0.5">
                  {displayEmail}
                </DialogDescription>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] font-bold">
                    {roleBadgeText}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-200 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active Session
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4 text-xs">
            {/* Identity & Workstation Info */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Jurisdiction Scope
                </span>
                <span className="font-bold text-foreground text-xs mt-0.5 flex items-center gap-1 truncate">
                  <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  {isCountry ? `${assignedCountry} (National)` : isCity ? `${assignedCity} (Municipal)` : isSuper ? "195 Nations (Global)" : "Worldwide Operations"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Security Provider
                </span>
                <span className="font-bold text-foreground text-xs mt-0.5 flex items-center gap-1 truncate">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Clerk Verified Token
                </span>
              </div>
            </div>

            {/* User ID copy row */}
            {user?.id && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/50 text-[11px]">
                <span className="text-muted-foreground font-mono truncate mr-2">
                  ID: {user.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.id, "User ID")}
                  className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Copy User ID"
                >
                  {copiedField === "User ID" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Delegated Authorities for Role */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-muted/20 border border-border/60">
              <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Delegated Administrative Authority
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">Active Role Level</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground pt-1">
                {isCountry && (
                  <>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Appoint and oversee City Admins across 30 municipal districts
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Direct national business directory verification & escalation
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Real-time international visitor telemetry for {assignedCountry}
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Issue nationwide commercial and regulatory broadcasts
                    </li>
                  </>
                )}
                {isOps && (
                  <>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Worldwide listing verification queue & storefront certification
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Citizen dispute resolution, customer claims & review moderation
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Directory health monitoring, analytics & international visitors
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Category taxonomy moderation & business compliance
                    </li>
                  </>
                )}
                {isSuper && (
                  <>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Worldwide master control across all 195 sovereign territories
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Direct Clerk publicMetadata role synchronization & account governance
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Security policy, IP blacklisting, database & audit logs
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Platform billing, subscriptions & revenue infrastructure
                    </li>
                  </>
                )}
                {isCity && (
                  <>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Municipal business verification & map pin location certification
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Trade license compliance audit & ownership claim approvals
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> Sub-city commercial corridor management & district notices
                    </li>
                    <li className="flex items-center gap-1.5 text-foreground/90 font-medium">
                      <span className="text-emerald-500 font-bold">✓</span> International visitor engagement monitoring for {assignedCity}
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border/60">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenBroadcast && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenBroadcast();
                    }}
                    className="gap-1.5 text-xs font-semibold w-full sm:w-auto h-8"
                  >
                    <Megaphone className="w-3.5 h-3.5 text-sky-500" />
                    Broadcast Notice
                  </Button>
                )}
                <Link href="/profile" className="w-full sm:w-auto" onClick={() => setIsOpen(false)}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold w-full sm:w-auto h-8">
                    <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Account Settings
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSignOut}
                  className="gap-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold px-4 h-8"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
