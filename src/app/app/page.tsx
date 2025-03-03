import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";
import { Button } from "@/app/_components/button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { ActivityDisplay } from "./_components/activity-display";
import { TaskManagement } from "./_components/task-management";
import { TaskProvider } from "./_components/task-context";
import { Footer } from "./_components/footer";
import { MobileBanner } from "./_components/mobile-banner";

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

            {/* Activity Display */}
            <section className="mb-8">
              <ActivityDisplay />
            </section>

            {/* Task Management */}
            <section>
              <TaskManagement />
            </section>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </TaskProvider>
    </HydrateClient>
  );
}
