"use client";

import React from "react";
import {
  X,
  ExternalLink,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Copy,
  Check,
  Play,
  Camera,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeEmbedUrl } from "@/lib/utils/youtube";

export interface LightboxMediaItem {
  id: string;
  title: string;
  url: string;
  type: string;
  businessName?: string;
  businessId?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  status?: string;
  description?: string;
  youtubeId?: string;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: LightboxMediaItem | null;
  onApprove?: (id: string) => void;
  onReport?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetAsCover?: (media: LightboxMediaItem) => void;
  canModerate?: boolean;
}

export function MediaLightboxModal({
  isOpen,
  onClose,
  media,
  onApprove,
  onReport,
  onDelete,
  onSetAsCover,
  canModerate = true,
}: MediaLightboxModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!media) return null;

  const handleCopyLink = () => {
    if (media.url) {
      navigator.clipboard.writeText(media.url);
      setCopied(true);
      toast.success("Media link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isVideo =
    media.type?.toLowerCase() === "video" ||
    Boolean(media.youtubeId) ||
    isYoutubeUrl(media.url);

  let embedYoutubeId =
    extractYoutubeVideoId(media.youtubeId) ||
    (isVideo ? extractYoutubeVideoId(media.url) : null);


  const formattedDate = media.uploadedAt
    ? new Date(media.uploadedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950/95 border-border/40 text-white rounded-3xl shadow-2xl backdrop-blur-2xl">
        <DialogTitle className="sr-only">{media.title || "Media Preview"}</DialogTitle>

        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          {/* Main Visual Stage */}
          <div className="relative flex-1 bg-black flex items-center justify-center min-h-[320px] md:min-h-[500px] overflow-hidden p-3">
            {isVideo && embedYoutubeId ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${embedYoutubeId}?autoplay=1&rel=0`}
                  title={media.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.url}
                alt={media.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl transition-transform"
              />
            )}

            {/* Type badge overlay */}
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/70 backdrop-blur-md text-white border-white/20 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-lg">
                {isVideo ? <Play className="w-3 h-3 text-red-500 fill-red-500" /> : <Camera className="w-3 h-3 text-sky-400" />}
                {media.type || "Photo"}
              </Badge>
            </div>
          </div>

          {/* Right Sidebar Metadata & Actions */}
          <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-slate-900/90 backdrop-blur-xl">
            <div className="space-y-5 overflow-y-auto">
              {/* Header Details */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    className={
                      media.status === "Approved"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]"
                        : media.status === "Reported"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 text-[11px]"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px]"
                    }
                  >
                    {media.status || "Approved"}
                  </Badge>
                  <span className="text-[11px] font-mono text-slate-400">{media.id}</span>
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{media.title || "Untitled Visual Asset"}</h3>
                {media.description && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{media.description}</p>
                )}
              </div>

              {/* Business & Uploader Info */}
              <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Business</span>
                    <span className="font-semibold text-slate-200">{media.businessName || "Platform Asset"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Uploaded By</span>
                    <span className="font-semibold text-slate-200">{media.uploadedBy || "System Admin"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Registration Date</span>
                    <span className="font-semibold text-slate-200">{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="w-full text-xs gap-2 border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied Link!" : "Copy Direct URL"}
                </Button>

                <a
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>

                {onSetAsCover && media.type?.toLowerCase() !== "cover" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSetAsCover(media);
                      toast.success(`Set "${media.title}" as primary cover!`);
                    }}
                    className="w-full text-xs gap-2 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Set as Business Cover
                  </Button>
                )}
              </div>
            </div>

            {/* Moderation Controls (for Admins) */}
            {canModerate && (
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Moderation Controls
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {onApprove && media.status !== "Approved" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onApprove(media.id);
                        onClose();
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Approve
                    </Button>
                  )}
                  {onReport && media.status !== "Reported" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onReport(media.id);
                        onClose();
                      }}
                      className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Flag
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete "${media.title}"?`)) {
                          onDelete(media.id);
                          onClose();
                        }
                      }}
                      className="text-xs col-span-2 gap-1.5 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Media Asset
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
