"use client";

import Link from "next/link";
import { SiGithub, SiX } from "react-icons/si";
import { useEffect, useState } from "react";

// Array of minimal inspirational quotes
const inspirationalMessages = [
  "keep it minimal.",
  "less, but better.",
  "simplicity is the ultimate sophistication.",
  "make space for what matters.",
  "quality over quantity.",
  "focus on what's essential.",
  "clear mind, clear path.",
  "do more with less.",
  "subtraction is addition.",
  "eliminate the unnecessary.",
  "clarity comes from simplicity.",
  "empty space, full mind.",
  "minimalism is not about having less, it's about making room for more of what matters.",
  "less noise, more signal.",
  "simplify to amplify.",
  "the quieter you become, the more you can hear.",
  "make today count.",
  "one task at a time.",
  "calm mind, better decisions.",
  "be present, be minimal.",
  "focus is a matter of deciding what not to do.",
];

// Component for rotating inspirational message
function InspirationalMessage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Select a random message on component mount
    const randomIndex = Math.floor(
      Math.random() * inspirationalMessages.length,
    );
    setMessage(inspirationalMessages[randomIndex] ?? "keep it minimal.");
  }, []);

  return (
    <div className="text-xs text-neutral-500 dark:text-neutral-400">
      {message}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto py-8">
      <div className="mx-auto w-full max-w-4xl border-t border-neutral-200 px-4 pt-8 dark:border-neutral-800">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-neutral-600 sm:flex-row dark:text-neutral-400">
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              terms
            </Link>
          </div>

          <InspirationalMessage />

          <div className="flex gap-4">
            <Link
              href="https://github.com/kvnwdev/zerodottodos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              <SiGithub className="h-4 w-4" />
            </Link>
            <Link
              href="https://x.com/kvnwdev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              <SiX className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
