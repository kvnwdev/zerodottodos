"use client";

import { useEffect, useState } from "react";
import * as motion from "motion/react-client";

export function HeroPattern() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute right-0 top-1/2 aspect-square w-[150%] -translate-y-1/2 select-none overflow-hidden md:w-[100%]">
      <div className="relative h-full w-full">
        <div className="absolute inset-0 grid rotate-12 scale-125 transform grid-cols-6 gap-4">
          {Array.from({ length: 36 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.02,
                ease: "easeOut",
              }}
            >
              <div className="aspect-square w-full rounded-2xl border border-neutral-100 bg-blue-50" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
