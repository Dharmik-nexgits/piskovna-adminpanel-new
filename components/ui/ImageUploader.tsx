import * as React from "react";
import { Image as ImageIcon, X, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploaderProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  label,
  className,
}: ImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock upload logic: In a real app, upload to server here
      // For now, creating a local object URL to simulate immediate preview
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative rounded-xl overflow-hidden group border border-secondary aspect-video bg-gray-50">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/90 rounded-lg text-xs font-semibold hover:bg-white text-gray-700 shadow-sm"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-3 py-1.5 bg-red-500/90 rounded-lg text-xs font-semibold hover:bg-red-500 text-white shadow-sm"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-secondary rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-brand-bg/50 transition-all group min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
            <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Click to upload or drag & drop
          </span>
          <span className="text-xs text-gray-400 mt-1">
            SVG, PNG, JPG or GIF (max. 5MB)
          </span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
