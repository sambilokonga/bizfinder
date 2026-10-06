"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Shield,
  Crown,
  Globe,
  MapPin,
  Mail,
  User,
  CheckCircle2,
  Lock,
  Sparkles,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { toast } from "sonner";

interface AssignGeoAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAssigned?: () => void;
  initialRole?: "super_admin" | "country_admin" | "city_admin";
  initialCountry?: string;
  initialCity?: string;
  currentAdminRole?: "super_admin" | "country_admin" | "city_admin" | "admin";
  currentAdminCountry?: string;
}

export function AssignGeoAdminModal({
  isOpen,
  onClose,
  onAdminAssigned,
  initialRole = "country_admin",
  initialCountry = "Ethiopia",
  initialCity = "",
  currentAdminRole = "super_admin",
  currentAdminCountry,
}: AssignGeoAdminModalProps) {
  const [role, setRole] = useState<"super_admin" | "country_admin" | "city_admin">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [assignedCountry, setAssignedCountry] = useState(
    currentAdminRole === "country_admin" && currentAdminCountry
      ? currentAdminCountry
      : initialCountry || "Ethiopia"
  );
  const [assignedCity, setAssignedCity] = useState(initialCity || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the logged-in user is a Country Admin, they can only assign City Admins within their assigned country
  const isCountryAdminLocked = currentAdminRole === "country_admin";

  useEffect(() => {
    if (isCountryAdminLocked && currentAdminCountry) {
      setAssignedCountry(currentAdminCountry);
      setRole("city_admin");
    }
  }, [isCountryAdminLocked, currentAdminCountry]);

  useEffect(() => {
    if (initialCountry) setAssignedCountry(initialCountry);
    if (initialCity) setAssignedCity(initialCity);
    if (initialRole) setRole(initialRole);
  }, [initialCountry, initialCity, initialRole, isOpen]);

  // Cities for the currently selected country
  const availableCities = getCitiesForCountry(assignedCountry);

  useEffect(() => {
    if (availableCities.length > 0 && (!assignedCity || !availableCities.includes(assignedCity))) {
      setAssignedCity(availableCities[0]);
    }
  }, [assignedCountry, availableCities, assignedCity]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (role === "city_admin" && !assignedCity) {
      toast.error("Please select an assigned city for the City Admin");
      return;
    }

    setIsSubmitting(true);

    try {
      const queryParams = new URLSearchParams();
      if (currentAdminRole) queryParams.set("callerRole", currentAdminRole);
      if (currentAdminCountry) queryParams.set("callerCountry", currentAdminCountry);
      const url = `/api/admin/geo-admins${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          assignedCountry: role === "super_admin" ? undefined : assignedCountry,
          assignedCity: role === "city_admin" ? assignedCity : undefined,
          password: password.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          data.message || `Successfully assigned ${name} and synchronized to Clerk Dashboard!`
        );
        onAdminAssigned?.();
        setName("");
        setEmail("");
        setPassword("");
        onClose();
      } else {
        toast.error(data.error || "Failed to assign administrator.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while assigning admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryEntry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === assignedCountry.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {role === "super_admin" ? (
                <Crown className="w-5 h-5 text-amber-500" />
              ) : role === "country_admin" ? (
                <Globe className="w-5 h-5 text-indigo-500" />
              ) : (
                <Building2 className="w-5 h-5 text-purple-500" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground">
                {role === "super_admin"
                  ? "Appoint Global Super Admin"
                  : role === "country_admin"
                  ? "Assign Country Main Admin"
                  : "Assign City Admin"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Directly synchronized with your <strong>Clerk Dashboard publicMetadata</strong> & MongoDB.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Role Toggle (Only Super Admin can switch) */}
          {!isCountryAdminLocked && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">
                Administrative Authority Level <span className="text-destructive">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("country_admin")}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    role === "country_admin"
                      ? "border-indigo-500 bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500/30"
                      : "border-border hover:border-primary/40 bg-slate-50 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                      Country Lead
                    </span>
                    {role === "country_admin" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground line-clamp-1">
                    1 per 195 nations
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("city_admin")}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    role === "city_admin"
                      ? "border-purple-500 bg-purple-500/10 shadow-sm ring-1 ring-purple-500/30"
                      : "border-border hover:border-primary/40 bg-slate-50 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-purple-500 shrink-0" />
                      City Admin
                    </span>
                    {role === "city_admin" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground line-clamp-1">
                    30 per country
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("super_admin")}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                    role === "super_admin"
                      ? "border-amber-500 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/30"
                      : "border-border hover:border-primary/40 bg-slate-50 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                      Super Admin
                    </span>
                    {role === "super_admin" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground line-clamp-1">
                    Global access
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Geographic Assignment Dropdowns (if not global super admin) */}
          {role !== "super_admin" && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  Territorial Jurisdiction
                </span>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {selectedCountryEntry?.flag} {assignedCountry}
                </Badge>
              </div>

              <div className={`grid ${role === "city_admin" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"} gap-3`}>
                {/* Country Selection */}
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">
                    Country (195 Sovereign Nations) <span className="text-destructive">*</span>
                  </label>
                  {isCountryAdminLocked ? (
                    <div className="h-9 px-3 rounded-xl border border-input bg-background flex items-center text-xs font-bold gap-2">
                      <span>{selectedCountryEntry?.flag}</span>
                      <span>{assignedCountry}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        Your Country
                      </Badge>
                    </div>
                  ) : (
                    <select
                      value={assignedCountry}
                      onChange={(e) => setAssignedCountry(e.target.value)}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {COUNTRIES_WITH_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* City Selection (For City Admin role) */}
                {role === "city_admin" && (
                  <div>
                    <label className="text-[11px] font-bold text-foreground block mb-1">
                      Assigned City (30 Cities per Nation) <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={assignedCity}
                      onChange={(e) => setAssignedCity(e.target.value)}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          🏙️ {city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Admin Details Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Administrator Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Holloway"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Official Email Address (Clerk Account) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin.ethiopia@bizfinder.et"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Initial Password <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to send Clerk invitation link"
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Clerk Sync Info Badge */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Assigning will immediately synchronize <strong>publicMetadata</strong> to your Clerk Dashboard and MongoDB database.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-bold gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSubmitting
                ? "Assigning & Syncing to Clerk..."
                : role === "super_admin"
                ? "Appoint Global Super Admin"
                : role === "country_admin"
                ? `Assign ${assignedCountry} Country Lead`
                : `Assign ${assignedCity || "City"} Admin`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
