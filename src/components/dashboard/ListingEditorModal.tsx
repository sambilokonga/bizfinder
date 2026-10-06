"use client";

import React, { useState } from "react";
import { X, Save, CheckCircle2, Building2, MapPin, Phone, Globe, Mail, DollarSign, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Business, PriceTier } from "@/types/business";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";
import { Category } from "@/types/category";

interface ListingEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onSave: (updated: Business) => void;
  categories?: Category[];
}

export function ListingEditorModal({
  isOpen,
  onClose,
  business,
  onSave,
  categories,
}: ListingEditorModalProps) {
  const [dbCategories, setDbCategories] = useState<Category[]>(categories || SEED_CATEGORIES);

  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setDbCategories(categories);
    } else if (isOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setDbCategories(data.categories);
          }
        })
        .catch(() => {});
    }
  }, [categories, isOpen]);
  const [formData, setFormData] = useState({
    name: business.name,
    categoryName: business.categoryName,
    categoryId: business.categoryId,
    addressLine: business.addressLine,
    telephone: business.telephone || "",
    whatsapp: business.whatsapp || "",
    email: business.email || "",
    website: business.website || "",
    description: business.description,
    shortDescription: business.shortDescription || "",
    priceTier: business.attributes.priceTier || "$$",
    delivery: business.attributes.delivery || false,
    parking: business.attributes.parking || false,
    wifi: business.attributes.wifi || false,
    acceptsCards: business.attributes.acceptsCards || false,
    outdoorSeating: business.attributes.outdoorSeating || false,
    accessible: business.attributes.accessible || false,
    yearEstablished: business.yearEstablished || 2020,
  });

  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Business = {
      ...business,
      name: formData.name,
      categoryId: formData.categoryId,
      addressLine: formData.addressLine,
      telephone: formData.telephone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      website: formData.website,
      description: formData.description,
      shortDescription: formData.shortDescription,
      yearEstablished: formData.yearEstablished,
      attributes: {
        ...business.attributes,
        priceTier: formData.priceTier as PriceTier,
        delivery: formData.delivery,
        parking: formData.parking,
        wifi: formData.wifi,
        acceptsCards: formData.acceptsCards,
        outdoorSeating: formData.outdoorSeating,
        accessible: formData.accessible,
      },
    };

    onSave(updated);
    setIsSavedToast(true);
    setTimeout(() => {
      setIsSavedToast(false);
      onClose();
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-6 bg-card border-border rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-black text-foreground flex items-center justify-between pb-2 border-b border-border">
          <span>Edit Business Profile Details</span>
        </DialogTitle>

        {isSavedToast ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-foreground">
              Profile Changes Saved!
            </h3>
            <p className="text-xs text-muted-foreground">
              Your live listing has been updated instantly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {/* Primary Details */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                1. Core Identity & Category
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">
                    Business Name
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: e.target.value,
                        categoryName:
                          dbCategories.find((c) => c.id === e.target.value)
                            ?.name || formData.categoryName,
                      })
                    }
                    className="w-full h-10 mt-1 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                  >
                    {dbCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.level > 1 ? `↳ ${c.name}` : c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">
                  Short Tagline
                </label>
                <Input
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescription: e.target.value })
                  }
                  placeholder="e.g. Authentic Ethiopian cuisine & world-class single origin coffee"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full mt-1 rounded-xl border border-input bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Contact & Location */}
            <div className="space-y-4 pt-4 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                2. Contact & Location
              </span>

              <div>
                <label className="text-xs font-bold text-foreground">
                  Street Address
                </label>
                <Input
                  required
                  value={formData.addressLine}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground">
                    Telephone
                  </label>
                  <Input
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    placeholder="+251 11 600 0000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    WhatsApp Number
                  </label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="251911000000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Amenities & Attributes */}
            <div className="space-y-4 pt-4 border-t border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                3. Amenities & Features
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.delivery}
                    onChange={(e) =>
                      setFormData({ ...formData, delivery: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span>Delivery Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.parking}
                    onChange={(e) =>
                      setFormData({ ...formData, parking: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span>Dedicated Parking</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.wifi}
                    onChange={(e) =>
                      setFormData({ ...formData, wifi: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span>High-speed Wi-Fi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsCards}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        acceptsCards: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span>Accepts Cards</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.outdoorSeating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outdoorSeating: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span>Outdoor Seating</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accessible}
                    onChange={(e) =>
                      setFormData({ ...formData, accessible: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <span>Wheelchair Accessible</span>
                </label>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="gap-2 font-bold">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
