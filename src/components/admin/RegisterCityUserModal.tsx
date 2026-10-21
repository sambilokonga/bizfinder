"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Users,
  Building2,
  Shield,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { SUBCITIES_DATABASE } from "@/lib/data/subcities-database";

interface RegisterCityUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered: (user: any) => void;
  targetCity: string;
  targetCountry: string;
}

export function RegisterCityUserModal({
  isOpen,
  onClose,
  onUserRegistered,
  targetCity,
  targetCountry,
}: RegisterCityUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "owner" | "city_admin">("user");
  const [subcity, setSubcity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available subcities for the city
  const availableSubcities = useMemo(() => {
    const list = SUBCITIES_DATABASE[targetCountry]?.[targetCity];
    if (list && list.length > 0) return list;
    if (targetCity.toLowerCase().includes("addis")) {
      return ["Bole", "Kirkos", "Yeka", "Arada", "Nifas Silk-Lafto", "Lideta", "Addis Ketema", "Gullele", "Akaky Kaliti", "Kolfe Keranio", "Lemi Kura"];
    }
    return ["Central District", "Commercial Corridor", "North Zone", "South Sector", "Eastern Suburb", "Western Metro"];
  }, [targetCountry, targetCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter user name and email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        role,
        country: targetCountry,
        city: targetCity,
        subcity: subcity || availableSubcities[0] || undefined,
        assignedCountry: role === "city_admin" ? targetCountry : undefined,
        assignedCity: role === "city_admin" ? targetCity : undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `User ${name} registered successfully!`);
        onUserRegistered(data.user);
        setName("");
        setEmail("");
        setPhone("");
        setNotes("");
        onClose();
      } else {
        toast.error(data.error || "Failed to register municipal user.");
      }
    } catch (err: any) {
      console.error("[RegisterCityUserModal] Error:", err);
      toast.error(err.message || "Failed to register user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-card border border-border shadow-2xl rounded-3xl">
        <DialogTitle className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            Register Municipal User
            <span className="block text-xs font-normal text-muted-foreground mt-0.5">
              Register citizen or business owner with verified city jurisdiction in {targetCity}, {targetCountry}
            </span>
          </div>
        </DialogTitle>

        <DialogDescription className="sr-only">
          Form to register a new municipal user with city jurisdiction data
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-5 mt-3">
          {/* Territory Badge Bar */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Municipal Jurisdiction:</span>
              <span className="text-primary">{targetCity}, {targetCountry}</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-background font-mono">
              Auto-Linked City Data
            </Badge>
          </div>

          {/* Role Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Select User Role</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === "user"
                    ? "bg-sky-500/10 border-sky-500 ring-2 ring-sky-500/20 text-sky-600 dark:text-sky-400"
                    : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <Users className="w-4 h-4 mb-1" />
                <div className="text-xs font-bold">Citizen / Consumer</div>
                <div className="text-[10px] text-muted-foreground">Regular local user</div>
              </button>

              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === "owner"
                    ? "bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <Building2 className="w-4 h-4 mb-1" />
                <div className="text-xs font-bold">Business Owner</div>
                <div className="text-[10px] text-muted-foreground">Storefront merchant</div>
              </button>

              <button
                type="button"
                onClick={() => setRole("city_admin")}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  role === "city_admin"
                    ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-background border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <Shield className="w-4 h-4 mb-1" />
                <div className="text-xs font-bold">City Admin</div>
                <div className="text-[10px] text-muted-foreground">Municipal official</div>
              </button>
            </div>
          </div>

          {/* User Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Full Name</label>
              <Input
                placeholder="e.g. Almaz Tadesse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. almaz@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Phone Number</label>
              <Input
                placeholder="e.g. +251 91 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Municipal Sub-City / District
              </label>
              <select
                value={subcity}
                onChange={(e) => setSubcity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-semibold"
              >
                {availableSubcities.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Municipal Registry Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Verified citizen registered at Addis Ababa Kirkos Sub-City Trade Bureau..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl gap-2 shadow-lg shadow-sky-500/20"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Register User in {targetCity}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
