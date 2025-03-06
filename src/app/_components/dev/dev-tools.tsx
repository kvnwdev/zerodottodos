"use client";

import { usePomodoro } from "@/app/_components/pomodoro/pomodoro-context";
import { Button } from "@/app/_components/ui/button";
import { useEffect, useState } from "react";

const isDev = process.env.NODE_ENV === "development";

export function DevTools() {
  const { state, toggleFastMode } = usePomodoro();
  const [isOpen, setIsOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("devToolsOpen");
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("devToolsOpen", isOpen.toString());
  }, [isOpen]);

  if (!isDev) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-2 right-4 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-500 shadow-lg transition-transform hover:scale-110 active:scale-95 dark:bg-neutral-800"
        title="Toggle Dev Tools"
      >
        {isOpen ? "×" : "⚙️"}
      </button>

      {/* Dev Tools Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transform border-t border-neutral-200 bg-white/80 px-4 py-2 backdrop-blur-sm transition-transform duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-950/80 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">dev tools</span>
            <div className="h-4 border-l border-neutral-200 dark:border-neutral-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">pomodoro:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFastMode}
                className="text-yellow-500"
              >
                {state.isFastMode ? "normal speed" : "fast speed"}
              </Button>
            </div>
          </div>
          <div className="text-xs text-neutral-500">
            {process.env.NODE_ENV} mode
          </div>
        </div>
      </div>
    </>
  );
}
