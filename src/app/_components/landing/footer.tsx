import Link from "next/link";
import { Github } from "lucide-react";
import { CountdownTimer } from "./countdown-timer";
import type { Session } from "next-auth";

export function Footer({ session }: { session: Session | null }) {
  return (
    <footer className="container mx-auto border-t border-neutral-200 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <div className="text-sm text-neutral-400">
          Made with purpose by{" "}
          <Link
            href="https://kvnw.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-900 transition-colors hover:text-neutral-600"
          >
            kevin
          </Link>
        </div>

        <CountdownTimer />

        <div className="flex flex-wrap items-center justify-center gap-4 sm:space-x-4 md:flex-nowrap md:space-x-8">
          <Link
            href={session ? "/app" : "/api/auth/signin"}
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
          >
            {session ? "Dashboard" : "Sign In"}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-900"
          >
            Terms
          </Link>
          <a
            href="https://github.com/kvnwdev/zerodottodos"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-900"
          >
            <Github className="h-4 w-4" />
            <span>Source</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
