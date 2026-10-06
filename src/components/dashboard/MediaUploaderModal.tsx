"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Play,
  Trash2,
  Plus,
  CheckCircle2,
  Sparkles,
  Camera,
  Link as LinkIcon,
  Crown,
  RotateCcw,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Business, BusinessMedia, MediaType } from "@/types/business";
import { toast } from "sonner";
import { extractYoutubeVideoId, getYoutubeThumbnail } from "@/lib/utils/youtube";

interface MediaUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onSaveMedia: (media: BusinessMedia[], youtubeId?: string) => void;
}

export function MediaUploaderModal({
  isOpen,
  onClose,
  business,
  onSaveMedia,
}: MediaUploaderModalProps) {
  const [mediaList, setMediaList] = useState<BusinessMedia[]>(
    business.media || []
  );
  const [youtubeVideoId, setYoutubeVideoId] = useState(
    business.youtubeVideoId || ""
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoType, setNewPhotoType] = useState<MediaType>("interior");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMediaList(business.media || []);
      setYoutubeVideoId(business.youtubeVideoId || "");
    }
  }, [isOpen, business]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, WebP).");
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
        setNewPhotoUrl(data.url);
        if (!newPhotoTitle.trim()) {
          const autoTitle = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          setNewPhotoTitle(autoTitle);
        }
        toast.success("Photo uploaded to storage!", { id: toastId });
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setNewPhotoUrl(base64);
          toast.success("Photo loaded from file", { id: toastId });
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setNewPhotoUrl(base64);
        toast.success("Photo loaded", { id: toastId });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) {
      toast.error("Please provide an image URL or upload a file.");
      return;
    }

    const newMedia: BusinessMedia = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: newPhotoUrl.trim(),
      type: newPhotoType,
      title: newPhotoTitle.trim() || `${business.name} – Photo`,
      sortOrder: mediaList.length + 1,
      uploadedAt: new Date().toISOString(),
    };

    setMediaList([...mediaList, newMedia]);
    setNewPhotoUrl("");
    setNewPhotoTitle("");
    toast.success("Photo added to list!");
  };

  const handleRemoveMedia = (id: string) => {
    setMediaList(mediaList.filter((m) => m.id !== id));
    toast.info("Photo removed from gallery");
  };

  const handleSetAsCover = (mediaItem: BusinessMedia) => {
    // Reorder with this item first and type 'cover'
    const updated = mediaList.map((m) =>
      m.id === mediaItem.id ? { ...m, type: "cover" as any } : m
    );
    setMediaList(updated);
    toast.success(`Designated "${mediaItem.title || 'Photo'}" as primary cover!`);
  };

  const handleSaveAll = () => {
    const cleanId = extractYoutubeVideoId(youtubeVideoId) || (youtubeVideoId.trim() || undefined);
    onSaveMedia(mediaList, cleanId);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleYoutubeUrlChange = (val: string) => {
    const extracted = extractYoutubeVideoId(val);
    setYoutubeVideoId(extracted || val);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-6 bg-card border-border rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogTitle className="text-xl font-black text-foreground flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span>Manage Media & Visual Showcase</span>
          </div>
        </DialogTitle>
        <DialogDescription className="sr-only">Upload photos and manage business media</DialogDescription>

        {isSaved ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-foreground">Media Gallery Synchronized!</h3>
            <p className="text-xs text-muted-foreground">Your business listing has been updated in database.</p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Add New Photo Studio */}
            <div className="p-4 rounded-3xl bg-muted/40 border border-border space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                Add New Photo to Gallery
              </span>

              {/* Dropzone & File Picker */}
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
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-background"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {isUploading ? "Uploading file..." : "Click or drag & drop photo to upload"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP</span>
                </div>
              </div>

              {/* URL or Direct Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Or enter image link..."
                    className="text-xs pl-8"
                  />
                </div>

                <select
                  value={newPhotoType}
                  onChange={(e) => setNewPhotoType(e.target.value as MediaType)}
                  className="text-xs font-semibold px-3 py-2 rounded-xl bg-background border border-border text-foreground focus:outline-none"
                >
                  <option value="interior">Interior View</option>
                  <option value="exterior">Exterior View</option>
                  <option value="menu">Menu / Offer</option>
                  <option value="product">Product Item</option>
                  <option value="staff">Team / Staff</option>
                  <option value="promo">Promo / Event</option>
                  <option value="cover">Primary Cover</option>
                  <option value="logo">Brand Logo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  placeholder="Photo caption (e.g. Garden Dining Patio)"
                  className="text-xs flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPhoto}
                  disabled={!newPhotoUrl.trim()}
                  className="text-xs font-bold gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photo
                </Button>
              </div>

              {newPhotoUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-border max-h-36 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newPhotoUrl} alt="Preview" className="w-full h-36 object-cover" />
                </div>
              )}
            </div>

            {/* YouTube Video Section */}
            <div className="space-y-3 p-4 rounded-3xl bg-muted/20 border border-border">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  YouTube Video Showcase Tour
                </span>
              </div>
              <Input
                value={youtubeVideoId}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or Video ID"
                className="text-xs"
              />

              {youtubeVideoId && (
                <div className="aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-border mt-2 bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title="Preview"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Current Photo Album Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Current Gallery ({mediaList.length} Photos)
                </span>
              </div>

              {mediaList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground">
                  No gallery photos yet. Upload photos above to showcase your business!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map((m) => (
                    <div
                      key={m.id}
                      className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-slate-900 shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.title || "Photo"} className="w-full h-full object-cover" />

                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-1">
                          <Badge className="bg-primary/80 text-white text-[9px] px-1.5 py-0 capitalize">
                            {m.type}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(m.id)}
                            className="p-1 rounded-md bg-red-600 hover:bg-red-500 text-white transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] text-white font-medium truncate">{m.title}</div>
                          {m.type !== "cover" && (
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(m)}
                              className="w-full text-[9px] font-bold py-0.5 rounded bg-white/20 hover:bg-white/30 text-white transition-colors"
                            >
                              Set as Cover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={handleSaveAll}
                className="text-xs font-bold gap-1.5 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save All Changes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
