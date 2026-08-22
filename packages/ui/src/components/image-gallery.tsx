"use client";

import * as React from "react";
import { cn } from "../lib/cn";

export interface GalleryImage {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
  thumbnailSrc?: string;
}

export interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4 | 5;
  aspectRatio?: "square" | "video" | "4/3" | "auto" | string;
  maxVisible?: number;
  className?: string;
  thumbnailClassName?: string;
  lightboxClassName?: string;
  onImageClick?: (index: number) => void;
}

const COLUMN_CLASSES: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

const ASPECT_CLASSES: Record<string, string> = {
  square: "aspect-square",
  video: "aspect-video",
  "4/3": "aspect-[4/3]",
  auto: "aspect-auto",
};

export function ImageGallery({
  images = [],
  columns = 3,
  aspectRatio = "square",
  maxVisible,
  className,
  thumbnailClassName,
  lightboxClassName,
  onImageClick,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const columnClass = COLUMN_CLASSES[columns] || "grid-cols-3";
  const aspectClass =
    ASPECT_CLASSES[aspectRatio] ||
    (aspectRatio.startsWith("aspect-") ? aspectRatio : `aspect-[${aspectRatio}]`);

  const hasMaxVisible =
    typeof maxVisible === "number" && maxVisible > 0 && images.length > maxVisible;
  const visibleImages = hasMaxVisible ? images.slice(0, maxVisible) : images;
  const remainingCount = hasMaxVisible ? images.length - maxVisible + 1 : 0;

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    if (onImageClick) {
      onImageClick(index);
    }
  };

  const handleClose = React.useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNext = React.useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
  }, [images.length]);

  const handlePrev = React.useCallback(() => {
    setSelectedIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
  }, [images.length]);

  React.useEffect(() => {
    if (selectedIndex === null) return;

    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedIndex, handleClose, handleNext, handlePrev]);

  const activeImage = selectedIndex !== null ? images[selectedIndex] : null;

  return (
    <>
      <div className={cn("grid gap-3 w-full", columnClass, className)}>
        {visibleImages.map((img, idx) => {
          const isLastOverlay = hasMaxVisible && idx === maxVisible - 1;
          const thumbSrc = img.thumbnailSrc || img.src;
          const defaultAlt = img.alt || `Thumbnail ${idx + 1}`;
          const buttonAriaLabel = isLastOverlay ? `View all ${images.length} images` : defaultAlt;

          return (
            <button
              key={idx}
              type="button"
              aria-label={buttonAriaLabel}
              onClick={() => handleThumbnailClick(idx)}
              className={cn(
                "relative group overflow-hidden rounded-kj-lg bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer transition-all duration-200",
                aspectClass,
                thumbnailClassName
              )}
            >
              <img
                src={thumbSrc}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {isLastOverlay && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xl group-hover:bg-black/70 transition-colors">
                  +{remainingCount}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedIndex !== null && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery lightbox"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
          className={cn(
            "fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-200 animate-in fade-in-0",
            lightboxClassName
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full text-white z-10">
            <span className="text-sm font-medium text-white/80 select-none">
              {selectedIndex + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main content with Prev/Image/Next */}
          <div className="relative flex-1 flex items-center justify-between gap-4 my-auto min-h-0 w-full">
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10 shrink-0"
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}

            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-0 px-2 select-none">
              <img
                src={activeImage.src}
                alt={activeImage.alt || `Image ${selectedIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain rounded-kj-md shadow-2xl transition-transform"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="p-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10 shrink-0"
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>

          {/* Footer (Title & Caption) */}
          {(activeImage.title || activeImage.caption) && (
            <div className="flex flex-col items-center justify-center text-center text-white pb-2 z-10">
              {activeImage.title && (
                <h3 className="text-base font-semibold text-white">{activeImage.title}</h3>
              )}
              {activeImage.caption && (
                <p className="text-xs sm:text-sm text-white/70 max-w-lg mt-0.5">
                  {activeImage.caption}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
