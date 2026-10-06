"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeThumbnail, getYoutubeEmbedUrl } from "@/lib/utils/youtube";

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Array<{ url: string; title?: string; type?: string; thumbnailUrl?: string }>;
  initialIndex?: number;
  businessName: string;
}

export function PhotoGalleryModal({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  businessName,
}: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const isVideo = currentPhoto?.type === "video" || isYoutubeUrl(currentPhoto?.url);
  const ytEmbed = isVideo ? getYoutubeEmbedUrl(currentPhoto?.url, { autoplay: true }) : null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 bg-black/95 text-white border-white/10 overflow-hidden rounded-3xl">
        <DialogTitle className="sr-only">
          Photo Gallery - {businessName}
        </DialogTitle>

        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {isVideo ? (
              <Play className="w-4 h-4 text-red-500 fill-red-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-indigo-400" />
            )}
            <span className="font-bold text-sm truncate max-w-sm">
              {businessName} {isVideo ? "Video Tour" : "Gallery"}
            </span>
          </div>
          <div className="text-xs font-semibold text-white/60">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>

        {/* Main Image or Video Stage */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center bg-black select-none">
          {isVideo && ytEmbed ? (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-6">
              <div className="w-full aspect-video max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <iframe
                  src={ytEmbed}
                  title={currentPhoto.title || `${businessName} Video`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title || businessName}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {/* Navigation Controls */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 z-20"
                title="Previous item"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-110 z-20"
                title="Next item"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image/Video Caption */}
          {currentPhoto.title && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs text-center text-white/90 z-10">
              {currentPhoto.title}
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {photos.length > 1 && (
          <div className="flex items-center gap-2.5 p-4 px-6 overflow-x-auto no-scrollbar bg-black/60 border-t border-white/10">
            {photos.map((item, idx) => {
              const isItemVid = item.type === "video" || isYoutubeUrl(item.url);
              const thumbUrl = isItemVid
                ? (item.thumbnailUrl || getYoutubeThumbnail(item.url))
                : item.url;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all group ${
                    idx === currentIndex
                      ? "border-indigo-500 scale-105 opacity-100 ring-2 ring-indigo-500/40"
                      : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isItemVid && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shadow">
                        <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
