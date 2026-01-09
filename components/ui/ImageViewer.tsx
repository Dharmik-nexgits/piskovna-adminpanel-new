import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageViewerProps {
  src: string | null;
  onClose: () => void;
  alt?: string;
}

export function ImageViewer({
  src,
  onClose,
  alt = "Image preview",
}: ImageViewerProps) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="cursor-pointer absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-51"
      >
        <X className="w-6 h-6" />
      </button>

      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
