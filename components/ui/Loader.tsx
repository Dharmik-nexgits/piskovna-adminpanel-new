import React from "react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  variant?: "default" | "fullscreen";
}

export function Loader({ className, variant = "default" }: LoaderProps) {
  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-500 font-medium text-sm animate-pulse">
            Načítání...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
