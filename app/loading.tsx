import { Loader2 } from "lucide-react";

export default function Loading({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="text-lg font-medium text-gray-600">Načítání...</span>
      </div>
    </div>
  );
}
