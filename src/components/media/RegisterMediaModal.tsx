"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Upload,
  Link as LinkIcon,
  Plus,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Crown,
  Layers,
  Info,
  X,
} from "lucide-react";
import { Business, BusinessMedia, MediaType } from "@/types/business";
import { buildRealShowcaseMedia } from "@/lib/data/real-media-showcase";
import { toast } from "sonner";

interface RegisterMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onMediaRegistered: (updatedMediaList: BusinessMedia[], newCoverUrl?: string) => void;
}

const MEDIA_TYPES: Array<{
  key: MediaType;
  label: string;
  desc: string;
  icon: string;
}> = [
  { key: "interior", label: "Interior View", desc: "Dining rooms, seating booths, decor, & lighting", icon: "🛋️" },
  { key: "exterior", label: "Exterior View", desc: "Storefront, facade, street entrance, & parking", icon: "🏢" },
  { key: "menu", label: "Menu & Offerings", desc: "Dishes, culinary specialties, drinks, & menus", icon: "🍽️" },
  { key: "product", label: "Product & Merch", desc: "Goods, retail packages, gifts, & displays", icon: "🛍️" },
  { key: "staff", label: "Team & Staff", desc: "Chefs, baristas, service staff, & managers", icon: "👥" },
  { key: "promo", label: "Promo & Events", desc: "Live music, celebrations, & seasonal setups", icon: "🎉" },
  { key: "cover", label: "Primary Cover Header", desc: "Top panoramic banner seen across the site", icon: "🌟" },
  { key: "logo", label: "Brand Logo / Avatar", desc: "Square or circular brand identity icon", icon: "🏷️" },
];

export function RegisterMediaModal({
  isOpen,
  onClose,
  business,
  onMediaRegistered,
}: RegisterMediaModalProps) {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoTitle, setPhotoTitle] = useState<string>("");
  const [photoType, setPhotoType] = useState<MediaType>("interior");
  const [isPrimaryCover, setIsPrimaryCover] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setPhotoUrl(data.url);
        if (!photoTitle.trim()) {
          const autoTitle = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          setPhotoTitle(`${business.name} – ${autoTitle}`);
        }
        toast.success("Photo uploaded to secure cloud storage!", { id: toastId });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setPhotoUrl(base64);
          if (!photoTitle.trim()) {
            setPhotoTitle(`${business.name} – Photo`);
          }
          toast.success("Photo loaded from file", { id: toastId });
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPhotoUrl(base64);
        toast.success("Photo loaded", { id: toastId });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRegisterSingleMedia = (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoUrl.trim()) {
      toast.error("Please upload an image or provide a valid image URL.");
      return;
    }

    const currentMedia = business.media || [];
    const newMediaItem: BusinessMedia = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: photoUrl.trim(),
      type: isPrimaryCover ? "cover" : photoType,
      title: photoTitle.trim() || `${business.name} – Photo`,
      sortOrder: isPrimaryCover ? 0 : currentMedia.length + 1,
      uploadedAt: new Date().toISOString(),
    };

    let updatedList: BusinessMedia[];
    let newCoverUrl: string | undefined = undefined;

    if (isPrimaryCover || photoType === "cover") {
      newCoverUrl = photoUrl.trim();
      updatedList = [newMediaItem, ...currentMedia.map((m) => (m.type === "cover" ? { ...m, type: "interior" as MediaType } : m))];
    } else {
      updatedList = [newMediaItem, ...currentMedia];
    }

    onMediaRegistered(updatedList, newCoverUrl);
    toast.success(`Registered new ${photoType} photo for ${business.name}!`);

    // Reset form
    setPhotoUrl("");
    setPhotoTitle("");
    setIsPrimaryCover(false);
    onClose();
  };

  const handleLoadRealShowcasePack = () => {
    const showcaseItems = buildRealShowcaseMedia(business.name || "Business");
    const currentMedia = business.media || [];
    
    // Combine showcase items with existing items without duplicates
    const existingUrls = new Set(currentMedia.map((m) => m.url));
    const newItems = showcaseItems.filter((m) => !existingUrls.has(m.url));
    const combined = [...newItems, ...currentMedia];

    const primaryCover = showcaseItems.find((m) => m.type === "cover");
    onMediaRegistered(combined, primaryCover?.url);

    toast.success(`Successfully loaded ${newItems.length} real showcase photos! (20+ items ready for pagination)`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 bg-card border-border rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="pb-3 border-b border-border space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-foreground">
                  Register Real Media &amp; Photos
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Add high-resolution photography, interior galleries, and cover banners for {business.name}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
              Live Media Studio
            </Badge>
          </div>
        </DialogHeader>

        {/* Quick Action: 1-Click Real Showcase Pack */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Instant Real Showcase Library (24+ Photos)</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automatically register 24 authentic high-res photos across dining rooms, menus, exterior, and staff to immediately test 20/page pagination.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="gradient"
            onClick={handleLoadRealShowcasePack}
            className="text-xs font-bold shrink-0 shadow-md shadow-purple-500/20 gap-1.5 h-8"
          >
            <Layers className="w-3.5 h-3.5" />
            Load 24 Real Photos
          </Button>
        </div>

        <form onSubmit={handleRegisterSingleMedia} className="space-y-4 pt-1">
          {/* File Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              1. Upload Photo File or Provide Link
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {isUploading ? "Uploading to Cloud Storage..." : "Click or drag & drop photo to upload"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Supports high-resolution JPG, PNG, WebP (auto-optimized)
                  </span>
                </div>
              </div>
            </div>

            {/* Direct URL Input */}
            <div className="relative pt-1">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Or paste external image URL (Unsplash, Cloudinary, AWS S3, etc.)..."
                className="text-xs pl-8 h-9"
              />
            </div>
          </div>

          {/* Live Preview */}
          {photoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-border bg-black max-h-48 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Upload preview"
                className="w-full h-44 object-cover object-center"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Ready to Register
              </div>
            </div>
          )}

          {/* Media Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              2. Select Media Category &amp; Placement
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEDIA_TYPES.map((t) => {
                const isSelected = photoType === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setPhotoType(t.key);
                      if (t.key === "cover") setIsPrimaryCover(true);
                    }}
                    className={`p-2.5 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
                        : "border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{t.icon}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <span className="font-bold text-foreground block">{t.label}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">
              3. Photo Caption &amp; Title
            </label>
            <Input
              value={photoTitle}
              onChange={(e) => setPhotoTitle(e.target.value)}
              placeholder={`e.g. ${business.name} – Garden Patio Dining Area`}
              className="text-xs h-9"
            />
          </div>

          {/* Primary Cover Checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border">
            <input
              type="checkbox"
              id="isPrimaryCover"
              checked={isPrimaryCover || photoType === "cover"}
              onChange={(e) => setIsPrimaryCover(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <label htmlFor="isPrimaryCover" className="text-xs font-medium text-foreground cursor-pointer select-none">
              <span className="font-bold">Set as Primary Profile Cover</span> — prominently display this photo on the top of your public profile
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={!photoUrl.trim() || isUploading}
              className="text-xs font-bold h-9 px-5 gap-1.5 shadow-md shadow-primary/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Photo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
