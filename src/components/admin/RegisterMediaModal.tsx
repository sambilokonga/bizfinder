"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Camera,
  Film,
  Building2,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  Layers,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Business } from "@/types/business";
import { extractYoutubeVideoId, getYoutubeThumbnail } from "@/lib/utils/youtube";

interface RegisterMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onMediaRegistered: (newMedia: any) => void;
  defaultBusinessId?: string;
  defaultType?: "Photo" | "Video" | "Logo" | "Cover";
}

export function RegisterMediaModal({
  isOpen,
  onClose,
  businesses,
  onMediaRegistered,
  defaultBusinessId = "",
  defaultType = "Photo",
}: RegisterMediaModalProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(defaultBusinessId);
  const [mediaType, setMediaType] = useState<"Photo" | "Video" | "Logo" | "Cover">(defaultType);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("Super Admin");
  const [status, setStatus] = useState<"Approved" | "Pending">("Approved");
  const [youtubeId, setYoutubeId] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-detect business name
  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);
  const businessName = selectedBusiness ? selectedBusiness.name : "Platform Media Asset";

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (defaultBusinessId) setSelectedBusinessId(defaultBusinessId);
      if (defaultType) setMediaType(defaultType);
    }
  }, [isOpen, defaultBusinessId, defaultType]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please upload an image or video file.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File exceeds 20MB limit.");
      return;
    }

    setIsUploadingFile(true);
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
        setUrl(data.url);
        if (!title.trim()) {
          const autoTitle = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          setTitle(autoTitle);
        }
        toast.success("File uploaded successfully!", { id: toastId });
      } else {
        // Fallback to FileReader base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setUrl(base64);
          toast.success("File loaded as visual data URI", { id: toastId });
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      // Fallback to local data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setUrl(base64);
        toast.success("Local file preview generated", { id: toastId });
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleYoutubeChange = (val: string) => {
    setUrl(val);
    const extracted = extractYoutubeVideoId(val);
    if (extracted) {
      setYoutubeId(extracted);
    } else {
      setYoutubeId(val.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a media title or caption.");
      return;
    }

    if (!url.trim()) {
      toast.error("Please upload a file or provide a valid media URL.");
      return;
    }

    setIsSubmitting(true);

    try {
      const resolvedYtId = mediaType === "Video" ? (extractYoutubeVideoId(youtubeId) || extractYoutubeVideoId(url)) : undefined;
      const payload = {
        title: title.trim(),
        type: mediaType,
        url: url.trim(),
        thumbnailUrl: resolvedYtId ? getYoutubeThumbnail(resolvedYtId) : undefined,
        businessId: selectedBusinessId || undefined,
        businessName,
        uploadedBy: uploadedBy.trim() || "Admin",
        status,
        description: description.trim(),
        youtubeId: resolvedYtId || undefined,
      };

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.media) {
        toast.success(`Media "${title}" registered successfully to database!`);
        onMediaRegistered(data.media);
        handleReset();
        onClose();
      } else {
        toast.error(data.error || "Failed to register media asset.");
      }
    } catch (err: any) {
      console.error("Error registering media:", err);
      toast.error(err.message || "Network error registering media.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setYoutubeId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 bg-card border-border rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogTitle className="text-xl font-black text-foreground flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span>Register Actual Media Asset</span>
              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                Register verified business photos, brand logos, covers, or video showcases.
              </p>
            </div>
          </div>
        </DialogTitle>
        <DialogDescription className="sr-only">Form to register a new media item</DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Media Type & Business Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Media Type</label>
              <div className="grid grid-cols-4 gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border">
                {[
                  { key: "Photo", label: "Photo" },
                  { key: "Cover", label: "Cover" },
                  { key: "Logo", label: "Logo" },
                  { key: "Video", label: "Video" },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setMediaType(t.key as any)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      mediaType === t.key
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Associate With Business</label>
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Platform Asset (General) --</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.cityName || "City"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media File Upload or URL Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                {mediaType === "Video" ? "YouTube Video Embed URL or ID" : "Upload File or Direct Media URL"}
              </label>
              <span className="text-[11px] text-muted-foreground">Supported: JPG, PNG, WEBP, MP4, YouTube</span>
            </div>

            {mediaType === "Video" ? (
              <div className="space-y-3">
                <Input
                  value={url}
                  onChange={(e) => handleYoutubeChange(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or Video ID"
                  className="text-xs"
                />
                {youtubeId && (
                  <div className="aspect-video w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-border shadow-md bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="Preview"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    dragActive
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {isUploadingFile ? "Uploading asset to storage..." : "Click to select or drag and drop media file"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        PNG, JPG, WebP, GIF up to 20MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct URL Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Or paste external CDN / Unsplash / image link..."
                      className="text-xs pl-8"
                    />
                  </div>
                  {url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUrl("")}
                      className="text-xs h-9 px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                {/* Image Preview Banner */}
                {url && (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-slate-900 max-h-56 flex items-center justify-center shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Preview" className="w-full h-56 object-cover" />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 backdrop-blur-md text-white text-[10px] border-white/20">
                        Preview Active
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title & Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Media Title / Caption *</label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. VIP Dining Lounge Interior"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Uploader Attribution</label>
              <Input
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="e.g. Super Admin"
                className="text-xs"
              />
            </div>
          </div>

          {/* Description & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-foreground">Description (Optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this photo/video showcase for search and accessibility..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Moderation Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Approved">Approved & Live</option>
                <option value="Pending">Pending Review</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={isSubmitting || !url.trim() || !title.trim()}
              className="text-xs font-bold gap-1.5 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering Media...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Register Media to Database</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
