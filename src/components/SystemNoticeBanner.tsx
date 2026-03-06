import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gigadata_system_notice_dismissed";

const MESSAGE =
  "Important Notice: Due to a recent technical database issue, some customer account records were lost. Our platform has been rebuilt with improved performance and security. You may need to create a new account when next using GigaData. We apologize for the inconvenience and appreciate your support.";

export const SystemNoticeBanner = () => {
  const [dismissed, setDismissed] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setDismissed(stored === "true");
    } catch {
      setDismissed(false);
    }
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      role="alert"
      className="relative z-50 w-full bg-amber-500/95 text-amber-950 border-b border-amber-600/30 shadow-sm animate-fade-in"
    >
      <div className="container mx-auto px-4 py-3 flex items-start sm:items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0 text-amber-700" />
        <p className="text-sm font-medium leading-snug flex-1 min-w-0">
          {MESSAGE}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 rounded-full hover:bg-amber-600/20 text-amber-800"
          onClick={handleDismiss}
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
