"use client";

import { useTheme } from "@/app/_components/theme-provider";
import { useEffect, useState } from "react";

export function MdrEasterEgg() {
  const { theme } = useTheme();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Only show the message when MDR theme is active
    if (theme === "mdr") {
      // Show message after a short delay for effect
      const timer = setTimeout(() => {
        setShowMessage(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [theme]);

  if (!showMessage) return null;

  return (
    <div className="p-4 text-center">
      <div className="mx-auto flex flex-col rounded bg-secondary px-4 py-2 text-xs text-foreground">
        <span className="font-mono">
          WELCOME TO MACRODATA REFINEMENT DIVISION • SERVING KIER SINCE 2020
        </span>
        <span className="text-xs italic">
          This project is an independent fan creation and is not affiliated with
          or endorsed by Apple Inc. Severance and Lumon Industries are
          properties of their respective owners.
        </span>
      </div>
    </div>
  );
}
