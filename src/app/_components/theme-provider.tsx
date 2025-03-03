"use client";

import { createContext, useContext, useEffect, useState } from "react";

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
  const [pathname, setPathname] = useState<string>("");

  // Initialization function - extract to make it reusable
  const initializeTheme = () => {
    try {
      // Get current pathname
      const currentPath = window.location.pathname;
      setPathname(currentPath);

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

  // Listen for pathname changes
  useEffect(() => {
    const handleRouteChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);

    // Also listen for Next.js route changes
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          setPathname(window.location.pathname);
        }
      });
    }

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  // Update document when theme changes, but only apply dark theme for /app routes
  useEffect(() => {
    // Don't do anything if theme is not yet initialized
    if (theme === undefined) return;

    // For landing page, always use light theme
    const isAppRoute = pathname.startsWith("/app");

    if (theme === "dark" && isAppRoute) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, pathname]);

  // Force a theme re-initialization when route changes to/from /app
  useEffect(() => {
    // Re-initialize theme when entering or leaving the app route
    initializeTheme();
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
