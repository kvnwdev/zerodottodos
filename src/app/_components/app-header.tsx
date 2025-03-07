"use client";

import Link from "next/link";
import { useTheme } from "@/app/_components/theme-provider";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { HelpDialog } from "@/app/_components/help-dialog";
import { Button } from "@/app/_components/ui/button";
import { Database } from "lucide-react";

interface AppHeaderProps {
  userName: string;
}

export function AppHeader({ userName }: AppHeaderProps) {
  const { theme } = useTheme();

  const isMdrTheme = theme === "mdr";

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {isMdrTheme ? (
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <span className="font-mono text-lg font-bold tracking-tighter text-primary">
              LUMON INDUSTRIES
            </span>
          </div>
        ) : (
          <Link href="/" className="text-lg font-bold">
            0.todos
          </Link>
        )}
        <span
          className={`text-xs ${isMdrTheme ? "font-mono text-primary" : "text-muted-foreground"}`}
        >
          {isMdrTheme
            ? `EMPLOYEE #${Math.floor(Math.random() * 10000)}`
            : userName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <HelpDialog />
        <ThemeToggle />
        <Button variant={isMdrTheme ? "secondary" : "link"} asChild>
          <Link
            href="/api/auth/signout"
            className={`text-sm ${isMdrTheme ? "font-mono tracking-tighter text-primary" : "text-muted-foreground"}`}
          >
            {isMdrTheme ? "EXIT" : "sign out"}
          </Link>
        </Button>
      </div>
    </header>
  );
}
