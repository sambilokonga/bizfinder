"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Key,
  Flame,
  Globe,
  Server,
  Smartphone,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Send,
  Loader2,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import {
  ISecurityEvent,
  SecuritySeverity,
  SecurityStatus,
  SecurityEventType,
  SecurityActionTaken,
} from "@/types/security";

interface RegisterSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSecurityEventRegistered: (event: ISecurityEvent) => void;
  currentAdminName?: string;
  currentAdminRole?: "super_admin" | "admin" | "country_admin" | "city_admin" | "owner" | "user";
  defaultTargetResource?: string;
}

export function RegisterSecurityModal({
  isOpen,
  onClose,
  onSecurityEventRegistered,
  currentAdminName = "Alex Rivera (Super Admin)",
  currentAdminRole = "super_admin",
  defaultTargetResource = "/admin/security",
}: RegisterSecurityModalProps) {
  const [eventType, setEventType] = useState<SecurityEventType>("brute_force_blocked");
  const [severity, setSeverity] = useState<SecuritySeverity>("high");
  const [status, setStatus] = useState<SecurityStatus>("investigating");
  const [actionTaken, setActionTaken] = useState<SecurityActionTaken>("blocked");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetResource, setTargetResource] = useState(defaultTargetResource);
  const [ipAddress, setIpAddress] = useState("196.188.15.4");
  const [city, setCity] = useState("Addis Ababa");
  const [country, setCountry] = useState("Ethiopia");
  const [device, setDevice] = useState<"Desktop" | "Mobile" | "Tablet" | "Server" | "Bot">("Bot");
  const [browser, setBrowser] = useState("Python-Requests/2.31");
  const [os, setOs] = useState("Linux x86_64");
  const [actorName, setActorName] = useState("Automated Threat Vector");
  const [actorEmail, setActorEmail] = useState("");
  const [actorRole, setActorRole] = useState<ISecurityEvent["actorRole"]>("anonymous");
  const [isFlagged, setIsFlagged] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event Type presets
  const EVENT_PRESETS: Array<{
    type: SecurityEventType;
    label: string;
    icon: React.ReactNode;
    defaultSeverity: SecuritySeverity;
    defaultAction: SecurityActionTaken;
    defaultTitle: string;
    defaultDesc: string;
    defaultDevice: "Desktop" | "Mobile" | "Tablet" | "Server" | "Bot";
  }> = [
    {
      type: "brute_force_blocked",
      label: "Brute Force Attack",
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      defaultSeverity: "critical",
      defaultAction: "blocked",
      defaultTitle: "High-Frequency Login Brute Force Throttled",
      defaultDesc: "Over 50 consecutive failed password attempts detected against admin endpoint within 90 seconds. Origin IP placed into firewall jail.",
      defaultDevice: "Bot",
    },
    {
      type: "unauthorized_access_attempt",
      label: "Unauthorized Access",
      icon: <Lock className="w-4 h-4 text-amber-500" />,
      defaultSeverity: "high",
      defaultAction: "blocked",
      defaultTitle: "Privileged API Route Traversal Probed",
      defaultDesc: "Unauthenticated client attempted to query sensitive financial ledger records without valid Bearer session authorization.",
      defaultDevice: "Bot",
    },
    {
      type: "ip_blocked",
      label: "Firewall IP Block",
      icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
      defaultSeverity: "high",
      defaultAction: "quarantined",
      defaultTitle: "Permanent IP Firewall Blocklist Rule Added",
      defaultDesc: "Malicious crawler originating from known proxy subnet permanently blacklisted from reaching directory APIs.",
      defaultDevice: "Server",
    },
    {
      type: "two_factor_enabled",
      label: "2FA Policy Enrollment",
      icon: <Shield className="w-4 h-4 text-emerald-500" />,
      defaultSeverity: "info",
      defaultAction: "allowed",
      defaultTitle: "Two-Factor Authentication Successfully Verified",
      defaultDesc: "Hardware or TOTP authenticator enrolled into account profile and confirmed with test verification token.",
      defaultDevice: "Desktop",
    },
    {
      type: "role_elevated",
      label: "Privilege Elevation",
      icon: <Key className="w-4 h-4 text-purple-500" />,
      defaultSeverity: "high",
      defaultAction: "allowed",
      defaultTitle: "Administrative Role & Territory Authority Granted",
      defaultDesc: "Super Administrator granted elevated territorial oversight permissions to regional administrator account.",
      defaultDevice: "Desktop",
    },
    {
      type: "ddos_mitigated",
      label: "DDoS Mitigation",
      icon: <Server className="w-4 h-4 text-indigo-500" />,
      defaultSeverity: "critical",
      defaultAction: "blocked",
      defaultTitle: "Volumetric HTTP Flood Suppressed by WAF",
      defaultDesc: "Traffic surge of 4,000 req/sec absorbed and dropped by edge reverse proxy rate limiters.",
      defaultDevice: "Bot",
    },
  ];

  const handleSelectPreset = (preset: typeof EVENT_PRESETS[0]) => {
    setEventType(preset.type);
    setSeverity(preset.defaultSeverity);
    setActionTaken(preset.defaultAction);
    setTitle(preset.defaultTitle);
    setDescription(preset.defaultDesc);
    setDevice(preset.defaultDevice);
    if (preset.defaultSeverity === "critical" || preset.defaultSeverity === "high") {
      setIsFlagged(true);
      setStatus("investigating");
    } else {
      setIsFlagged(false);
      setStatus("logged");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both an incident title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/security/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          severity,
          status,
          title: title.trim(),
          description: description.trim(),
          targetResource: targetResource.trim() || "/admin/security",
          ipAddress: ipAddress.trim() || "196.188.15.4",
          city: city.trim() || "Addis Ababa",
          country: country.trim() || "Ethiopia",
          device,
          browser: browser.trim() || "Chrome 128",
          os: os.trim() || "Windows 11",
          actorName: actorName.trim() || currentAdminName,
          actorEmail: actorEmail.trim() || undefined,
          actorRole,
          actionTaken,
          isFlagged,
          metadata: {
            registeredBy: currentAdminName,
            registeredAt: new Date().toISOString(),
            incidentCategory: "Forensic Registration",
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.event) {
        toast.success(`Security event "${data.event.title}" registered to live database!`);
        onSecurityEventRegistered(data.event);
        onClose();
      } else {
        toast.error(data?.error || "Failed to register security event.");
      }
    } catch (err: any) {
      console.error("Error registering security event:", err);
      toast.error(err.message || "Network error while registering security event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6 rounded-3xl bg-card border border-border shadow-2xl">
        <DialogTitle className="sr-only">Register Real Security Event</DialogTitle>
        <DialogDescription className="sr-only">
          Record a live security telemetry event, brute force block, or firewall rule into MongoDB.
        </DialogDescription>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-foreground">Register Security Event & Audit Log</h3>
                <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold">
                  Live MongoDB Telemetry
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Document threats, enforce firewall blocks, record authentication logs, or verify security defenses.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-xs">
          {/* Quick Presets Selection */}
          <div>
            <label className="font-bold text-foreground block mb-2 text-[11px] uppercase tracking-wider">
              1. Choose Security Event Type Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EVENT_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.type}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    eventType === p.type
                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40 font-bold"
                      : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="shrink-0">{p.icon}</div>
                  <div className="truncate text-xs">{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity & Action Taken */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Threat Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SecuritySeverity)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-1 focus:ring-primary"
              >
                <option value="critical">🔴 Critical Threat</option>
                <option value="high">🟠 High Severity</option>
                <option value="medium">🟡 Medium Concern</option>
                <option value="low">🔵 Low Severity</option>
                <option value="info">ℹ️ Informational / Audit</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Defensive Action Taken *</label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value as SecurityActionTaken)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-1 focus:ring-primary"
              >
                <option value="blocked">🚫 Blocked at Firewall</option>
                <option value="quarantined">☣️ Quarantined / Jailed</option>
                <option value="session_terminated">🛑 Session Terminated</option>
                <option value="account_locked">🔒 Account Locked</option>
                <option value="2fa_challenged">🔐 2FA Challenged</option>
                <option value="flagged">🚩 Flagged for Review</option>
                <option value="allowed">✅ Allowed / Nominal</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Investigation Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SecurityStatus)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-1 focus:ring-primary"
              >
                <option value="investigating">🔍 Under Investigation</option>
                <option value="blocked">🛡️ Actively Blocked</option>
                <option value="resolved">🟢 Resolved & Mitigated</option>
                <option value="logged">📝 Logged Only</option>
                <option value="dismissed">⚪ Dismissed False Positive</option>
              </select>
            </div>
          </div>

          {/* Title and Target Resource */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Incident / Event Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brute-Force Password Guessing Blocked"
                required
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Target Resource / Endpoint *</label>
              <Input
                value={targetResource}
                onChange={(e) => setTargetResource(e.target.value)}
                placeholder="e.g. /admin/sign-in, /api/payments"
                required
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Detailed Forensic Description */}
          <div>
            <label className="font-bold text-foreground block mb-1">Detailed Forensic Summary *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe event payload, detection method, duration, and mitigation outcome..."
              rows={3}
              required
              className="text-xs"
            />
          </div>

          {/* Origin Network Information */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
            <div className="font-bold text-foreground flex items-center gap-1.5 text-xs">
              <Globe className="w-3.5 h-3.5 text-primary" /> Origin Network & Geolocation Telemetry
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Origin IP Address</label>
                <Input
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 196.188.15.4"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">City / Region</label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Addis Ababa"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Country</label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Ethiopia"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Client Device Type</label>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value as any)}
                  className="w-full h-8 rounded-xl border border-input bg-background px-2 text-xs font-semibold"
                >
                  <option value="Desktop">Desktop PC / Mac</option>
                  <option value="Mobile">Mobile Phone</option>
                  <option value="Tablet">Tablet Device</option>
                  <option value="Server">Remote Server</option>
                  <option value="Bot">Automated Bot / Scraper</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">User Agent / Client</label>
                <Input
                  value={browser}
                  onChange={(e) => setBrowser(e.target.value)}
                  placeholder="e.g. Chrome 128, Python-Requests"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Operating System</label>
                <Input
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  placeholder="e.g. Windows 11, Linux, macOS"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Actor Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Actor Identity / Entity</label>
              <Input
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="e.g. Alex Rivera, Botnet Node #4"
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Actor Email (If Authenticated)</label>
              <Input
                type="email"
                value={actorEmail}
                onChange={(e) => setActorEmail(e.target.value)}
                placeholder="e.g. user@bizfinder.et"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Actor Role Category</label>
              <select
                value={actorRole}
                onChange={(e) => setActorRole(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-semibold"
              >
                <option value="anonymous">Anonymous / Unauthenticated</option>
                <option value="user">Registered Customer (User)</option>
                <option value="owner">Business Owner</option>
                <option value="city_admin">City Admin</option>
                <option value="country_admin">Country Lead Admin</option>
                <option value="admin">System Admin</option>
                <option value="super_admin">Super Admin Root</option>
                <option value="system">Automated Daemon / System</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-bold gap-1.5 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering to Database...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Register Security Event</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
