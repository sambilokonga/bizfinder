"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, Shield, Sparkles, MapPin, Phone, Globe, Mail } from "lucide-react";
import { Business } from "@/types/business";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";

interface EditBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business | null;
  onUpdateBusiness: (updated: Business) => void;
}

export function EditBusinessModal({
  isOpen,
  onClose,
  business,
  onUpdateBusiness,
}: EditBusinessModalProps) {
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [cityName, setCityName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [businessLevel, setBusinessLevel] = useState<"Small" | "Medium" | "Large" | "International">("Small");
  const [isVerified, setIsVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<string>("open");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (business) {
      setName(business.name || "");
      setCategoryName(business.categoryName || "");
      setCountryName((business as any).countryName || "");
      setCityName(business.cityName || "");
      setDistrictName(business.districtName || "");
      setTelephone(business.telephone || business.mobile || "");
      setEmail(business.email || "");
      setWebsite(business.website || "");
      setBusinessLevel(business.businessLevel || "Small");
      setIsVerified(!!business.isVerified);
      setIsFeatured(!!business.isFeatured);
      setStatus(business.status || "open");
    }
  }, [business]);

  const availableCities = countryName ? getCitiesForCountry(countryName) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !name.trim()) return;

    const updated: Business = {
      ...business,
      name: name.trim(),
      categoryName: categoryName.trim(),
      ...(countryName ? { countryName: countryName.trim() } : {}),
      cityName: cityName.trim(),
      districtName: districtName.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
      website: website.trim(),
      businessLevel,
      isVerified,
      isFeatured,
      status: status as any,
    };

    onUpdateBusiness(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  if (!business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-card border-border rounded-3xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Admin Business Control: {business.name}</span>
          </div>
          <Badge variant={isVerified ? "success" : "outline"} className="text-xs">
            {isVerified ? "Verified" : "Unverified"}
          </Badge>
        </DialogTitle>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-foreground">
              Business Listing Updated!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">
                Business Trading Name
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Primary Category
                </label>
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  District / Area
                </label>
                <Input
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder="District, Neighbourhood..."
                  className="text-xs"
                />
              </div>
            </div>

            {/* Country + City Selectors (195 Nations) */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
              <div>
                <label className="font-bold text-foreground block mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  Country (195 Nations)
                </label>
                <select
                  value={countryName}
                  onChange={(e) => {
                    setCountryName(e.target.value);
                    setCityName(""); // Reset city when country changes
                  }}
                  className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">🌐 Select Country...</option>
                  {COUNTRIES_WITH_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  City / Municipality
                </label>
                {availableCities.length > 0 ? (
                  <select
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="">Select City...</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="City name..."
                    className="text-xs"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border/80">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Business Level / Tier
                </label>
                <select
                  value={businessLevel}
                  onChange={(e) => setBusinessLevel(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Small">Small Business</option>
                  <option value="Medium">Medium Enterprise</option>
                  <option value="Large">Large Corporate</option>
                  <option value="International">International Brand</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Operating Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="open">Open / Active</option>
                  <option value="closed">Temporarily Closed</option>
                  <option value="pending">Pending Approval</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Admin Badges
                </label>
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Verified Badge</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Featured Spotlight</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Telephone / Mobile
                </label>
                <Input
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Official Email
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Website URL
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="gradient">
                Update Listing
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
