"use client";

import React, { useState, useEffect } from "react";
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

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen || !photos || photos.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, photos]);

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
      <DialogContent
        hideCloseButton
        className="w-[96vw] sm:w-[94vw] max-w-5xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col gap-0 p-0 bg-black/95 text-white border-white/10 overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl my-auto"
      >
        <DialogTitle className="sr-only">
          Photo Gallery - {businessName}
        </DialogTitle>

        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 xs:p-3.5 sm:p-4 px-3.5 xs:px-4 sm:px-6 border-b border-white/10 bg-black/60 backdrop-blur-md shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isVideo ? (
              <Play className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-red-500 fill-red-500 shrink-0" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-400 shrink-0" />
            )}
            <span
              className="font-bold text-xs xs:text-sm truncate leading-tight text-white/95"
              title={`${businessName} ${isVideo ? "Video Tour" : "Gallery"}`}
            >
              {businessName} {isVideo ? "Video Tour" : "Gallery"}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] xs:text-xs font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 xs:p-1.5 rounded-full hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all shrink-0"
              title="Close gallery"
              aria-label="Close gallery"
            >
              <X className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
            </button>
          </div>
        </div>

        {/* Main Image or Video Stage */}
        <div className="relative flex-1 min-h-[42vh] xs:min-h-[48vh] sm:min-h-[55vh] md:min-h-[60vh] max-h-[68vh] w-full flex items-center justify-center bg-black/90 select-none overflow-hidden">
          {isVideo && ytEmbed ? (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-6">
              <div className="w-full aspect-video max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
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
              className="max-h-full max-w-full object-contain pointer-events-none"
            />
          )}

          {/* Navigation Controls */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 xs:left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-105 active:scale-95 z-20 flex items-center justify-center shadow-lg"
                title="Previous item"
                aria-label="Previous item"
              >
                <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 xs:right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/20 hover:scale-105 active:scale-95 z-20 flex items-center justify-center shadow-lg"
                title="Next item"
                aria-label="Next item"
              >
                <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Image/Video Caption */}
          {currentPhoto.title && (
            <div className="absolute bottom-2 xs:bottom-3 sm:bottom-4 left-2 xs:left-3 sm:left-4 right-2 xs:right-3 sm:right-4 bg-black/75 backdrop-blur-md p-2 xs:p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 text-[11px] xs:text-xs text-center text-white/90 z-10 truncate max-w-xl mx-auto shadow-md">
              {currentPhoto.title}
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {photos.length > 1 && (
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 p-2.5 xs:p-3 sm:p-4 px-3 xs:px-4 sm:px-6 overflow-x-auto no-scrollbar bg-black/70 border-t border-white/10 shrink-0">
            {photos.map((item, idx) => {
              const isItemVid = item.type === "video" || isYoutubeUrl(item.url);
              const thumbUrl = isItemVid
                ? (item.thumbnailUrl || getYoutubeThumbnail(item.url))
                : item.url;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-13 h-9 xs:w-14 xs:h-10 sm:w-16 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shrink-0 border-2 transition-all group ${
                    idx === currentIndex
                      ? "border-indigo-500 scale-105 opacity-100 ring-2 ring-indigo-500/40"
                      : "border-transparent opacity-50 hover:opacity-85"
                  }`}
                  title={item.title || `Item ${idx + 1}`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbUrl}
                    alt={item.title || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isItemVid && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-4 h-4 xs:w-5 xs:h-5 rounded-full bg-red-600 flex items-center justify-center shadow">
                        <Play className="w-2 h-2 xs:w-2.5 xs:h-2.5 fill-white text-white ml-0.5" />
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
