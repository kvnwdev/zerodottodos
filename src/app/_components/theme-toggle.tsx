"use client";

import { useTheme } from "@/app/_components/theme-provider";
import { Button } from "@/app/_components/ui/button";
import { Moon, Sun, Database } from "lucide-react";
import { useRef, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme, setMdrTheme } = useTheme();
  const [longPressActive, setLongPressActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressCompletedRef = useRef(false);

  // Handler for mouse/touch down - start the timer
  const handlePressStart = () => {
    setLongPressActive(true);
    longPressCompletedRef.current = false;
    timerRef.current = setTimeout(() => {
      setMdrTheme();
      longPressCompletedRef.current = true;
      setLongPressActive(false);
    }, 1000); // 1 second hold time
  };

  // Handler for mouse/touch up - clear the timer
  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLongPressActive(false);
  };

  // Handle normal click (for regular theme toggle)
  const handleClick = () => {
    // Only toggle theme if it wasn't a long press
    if (!longPressCompletedRef.current) {
      toggleTheme();
    }
    // Reset the completed flag after handling the click
    setTimeout(() => {
      longPressCompletedRef.current = false;
    }, 0);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className={`h-8 w-8 transition-all ${longPressActive ? "scale-95" : ""}`}
      aria-label={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "light" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Database className="h-4 w-4 text-blue-400" />
      )}
    </Button>
  );
}
