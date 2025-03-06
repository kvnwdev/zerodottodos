"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation"; // Add import for Next.js usePathname hook

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Path-aware theme provider that only applies dark theme to /app routes
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with undefined theme to prevent initial flashing
  const [theme, setTheme] = useState<Theme | undefined>(undefined);
  // Use Next.js usePathname hook instead of managing pathname manually
  const pathname = usePathname();

  // Initialization function - extract to make it reusable
  const initializeTheme = () => {
    try {
      // Check if theme was previously stored
      const storedTheme = localStorage.getItem("theme") as Theme | null;

      // Set the theme based on storage or system preference
      if (storedTheme && (storedTheme === "light" || storedTheme === "dark")) {
        setTheme(storedTheme);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    } catch (e) {
      // Fallback to light theme if any errors
      setTheme("light");
      console.error("Error initializing theme:", e);
    }
  };

  // Initialize theme from localStorage or system preference on mount
  useEffect(() => {
    initializeTheme();

    // Also listen for storage events (in case theme is changed in another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "theme") {
        initializeTheme();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update document when theme changes, applying to appropriate routes
  useEffect(() => {
    // Don't do anything if theme is not yet initialized
    if (theme === undefined) return;

    // For landing page, always use light theme
    const isAppRoute = pathname?.startsWith("/app");

    // Modified logic to handle theme switching properly
    if (theme === "dark" && isAppRoute) {
      document.documentElement.classList.add("dark");
    } else if (theme === "light" || !isAppRoute) {
      document.documentElement.classList.remove("dark");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, pathname]);

  // Re-initialize theme when route changes
  useEffect(() => {
    // Just apply existing theme when pathname changes - don't reinitialize
    // This keeps the user's preference intact during navigation
  }, [pathname]);

  const toggleTheme = () => {
    setTheme((prev) => {
      // Handle the undefined case
      if (prev === undefined) return "dark";
      return prev === "light" ? "dark" : "light";
    });
  };

  // Provide a default value while theme is initializing
  const contextValue = {
    theme: theme ?? "light",
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
