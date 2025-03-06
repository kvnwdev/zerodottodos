import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/app/_components/ui/button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { ActivityDisplay } from "@/app/_components/activity-display";
import { TaskManagement } from "@/app/_components/task-management";
import { TaskProvider } from "@/app/_components/task-context";
import { Footer } from "@/app/_components/footer";
import { MobileBanner } from "@/app/_components/mobile-banner";
import { PomodoroTimer } from "@/app/_components/pomodoro/pomodoro-timer";
import { DevTools } from "@/app/_components/dev/dev-tools";

export default async function AppPage() {
  const session = await auth();

  // Protect this route - redirect to home if not logged in
  if (!session?.user) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <TaskProvider>
        <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
          <MobileBanner />
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4">
            <header className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="text-lg font-bold">
                  0.todos
                </Link>
                <span className="text-xs text-neutral-500">
                  {session.user.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="link" asChild>
                  <Link
                    href="/api/auth/signout"
                    className="text-sm text-neutral-600 dark:text-neutral-400"
                  >
                    sign out
                  </Link>
                </Button>
              </div>
            </header>

            {/* Toolbar with Pomodoro Timer */}
            <section className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
              <PomodoroTimer />
            </section>

            {/* Activity Display */}
            <section className="mb-8">
              <ActivityDisplay />
            </section>

            {/* Task Management */}
            <section>
              <TaskManagement />
            </section>

            {/* Footer */}
            <Footer />
          </div>
          <DevTools />
        </div>
      </TaskProvider>
    </HydrateClient>
  );
}
