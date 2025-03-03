import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { ActivityDisplay } from "@/app/app/_components/activity-display";
import { TaskManagement } from "@/app/app/_components/task-management";
import { TaskProvider } from "@/app/app/_components/task-context";
import Link from "next/link";
import { Button } from "@/app/_components/button";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { Footer } from "@/app/app/_components/footer";

export default async function AppPage() {
  const session = await auth();

  // Protect this route - redirect to home if not logged in
  if (!session?.user) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <TaskProvider>
        <div className="flex min-h-screen flex-col">
          <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
            <header className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">0.todos</h1>
                <p className="text-sm text-neutral-400">{session.user.name}</p>
              </div>
              <div className="flex gap-2">
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
