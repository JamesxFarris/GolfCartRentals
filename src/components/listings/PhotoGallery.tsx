"use client";

import { useState } from "react";

interface PhotoGalleryProps {
  photos: string[];
  name: string;
}

export default function PhotoGallery({ photos, name }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Main photo */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-100" style={{ aspectRatio: "16/9" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[activeIndex]}
          alt={`${name} - photo ${activeIndex + 1} of ${photos.length}`}
          className="w-full h-full object-cover"
        />
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
            {activeIndex + 1} / {photos.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-16 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex
                  ? "border-primary-600"
                  : "border-transparent hover:border-primary-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo}
                alt={`${name} - thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
