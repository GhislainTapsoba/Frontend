import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex justify-center items-center py-8"
    >
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      <span className="sr-only">Chargement...</span>
    </div>
  );
}
