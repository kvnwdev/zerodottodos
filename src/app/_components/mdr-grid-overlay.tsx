"use client";

import { useTheme } from "@/app/_components/theme-provider";
import { useEffect, useState } from "react";

export function MdrGridOverlay() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || theme !== "mdr") return null;

  return (
    <div className="pointer-events-none fixed inset-0 opacity-20">
      {/* Horizontal grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`h-${i}`} className="h-px w-full bg-primary opacity-30" />
        ))}
      </div>

      {/* Vertical grid lines */}
      <div className="absolute inset-0 flex justify-between">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`v-${i}`} className="h-full w-px bg-primary opacity-30" />
        ))}
      </div>

      {/* Random numbers like in the screenshot */}
      <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(10,1fr)]">
        {Array.from({ length: 200 }).map((_, i) => {
          const randomNum = Math.floor(Math.random() * 10);
          const opacity = Math.random() * 0.5 + 0.2;

          return (
            <div
              key={`num-${i}`}
              className="flex items-center justify-center text-primary"
              style={{ opacity }}
            >
              <span className="font-mono text-sm">{randomNum}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
