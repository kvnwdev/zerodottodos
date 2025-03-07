import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { ActivityDisplay } from "@/app/_components/activity-display";
import { TaskManagement } from "@/app/_components/task-management";
import { TaskProvider } from "@/app/_components/task-context";
import { Footer } from "@/app/_components/footer";
import { MobileBanner } from "@/app/_components/mobile-banner";
import { PomodoroTimer } from "@/app/_components/pomodoro/pomodoro-timer";
import { DevTools } from "@/app/_components/dev/dev-tools";
import { AppHeader } from "@/app/_components/app-header";
import { MdrEasterEgg } from "@/app/_components/mdr-easter-egg";
export default async function AppPage() {
  const session = await auth();

  // Protect this route - redirect to home if not logged in
  if (!session?.user) {
    redirect("/");
  }

  return (
    <HydrateClient>
      <TaskProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <MobileBanner />
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 text-foreground">
            <AppHeader userName={session.user.name ?? ""} />

            <MdrEasterEgg />

            {/* Toolbar with Pomodoro Timer */}
            <section className="mb-4 flex items-center justify-between border-b border-border pb-4">
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
