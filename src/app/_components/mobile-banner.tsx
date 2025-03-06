"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function MobileBanner() {
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if screen width is less than 768px (typical mobile breakpoint)
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    // Check on initial load
    checkMobile();

    // Set up event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Check if user has previously dismissed the banner
    const bannerDismissed = localStorage.getItem("mobileBannerDismissed");
    if (bannerDismissed) {
      setDismissed(true);
    }

    // Clean up event listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("mobileBannerDismissed", "true");
  };

  if (!isMobile || dismissed) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-50 px-4 py-2 dark:bg-amber-900/70">
      <div className="flex items-center justify-between">
        <p className="text-xs text-amber-800 dark:text-amber-100">
          We&apos;re still optimizing for mobile devices. For the best
          experience, please use a desktop browser.
        </p>
        <button
          onClick={handleDismiss}
          className="ml-2 rounded-full p-1 text-amber-800 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-800"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
