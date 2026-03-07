"use client";

import { useState } from "react";
import PhotoGallery from "./PhotoGallery";
import PhotoUpload from "./PhotoUpload";

interface PhotoManagerProps {
  listingId: string;
  initialPhotos: string[];
  name: string;
  canManage: boolean;
}

export default function PhotoManager({
  listingId,
  initialPhotos,
  name,
  canManage,
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div>
      {photos.length > 0 && <PhotoGallery photos={photos} name={name} />}

      {canManage && (
        <div className={photos.length > 0 ? "" : "mb-8"}>
          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              {photos.length > 0 ? "Manage Photos" : "Add Photos"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Manage Photos
                </h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Done
                </button>
              </div>
              <PhotoUpload
                listingId={listingId}
                currentPhotos={photos}
                onPhotosChanged={setPhotos}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
