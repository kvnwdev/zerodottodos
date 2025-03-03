import Link from "next/link";
import * as motion from "motion/react-client";
import { auth } from "@/server/auth";
import { FlickeringGrid } from "./_components/flickering-grid";
import { Button } from "@/app/_components/button";
import { HydrateClient } from "@/trpc/server";
import { TimeLeft } from "./_components/landing/time-left";
import { TimeVisualizer } from "./_components/landing/time-visualizer";
import { Footer } from "./_components/landing/footer";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col bg-white font-[system-ui] text-neutral-900 antialiased">
        <motion.div
          className="fixed inset-x-0 top-0 z-50 h-16 border-b border-neutral-200 bg-white/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="container mx-auto flex h-full items-center justify-between px-4">
            <span className="text-sm font-medium">0.todos</span>
            <Button variant="ghost" asChild>
              <Link href={session ? "/app" : "/api/auth/signin"}>
                {session ? "Dashboard" : "Sign In"}
              </Link>
            </Button>
          </div>
        </motion.div>

        <main className="w-full">
          <motion.header
            className="relative w-full overflow-hidden pb-24 pt-48 md:pb-64 md:pt-64"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="container mx-auto grid grid-cols-2 items-center gap-16">
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 text-sm font-medium text-neutral-400"
                >
                  Time management, decluttered
                </motion.div>
                <h1 className="mb-8 text-5xl font-medium tracking-tight md:text-7xl">
                  Time is finite.
                  <br />
                  Make it count.
                </h1>
                <p className="max-w-lg text-lg text-neutral-500 md:text-xl">
                  A minimal task manager that helps you focus on what matters,
                  eliminating the noise of complex organization.
                </p>
                <div className="mt-12 flex gap-4">
                  <Button variant="outline" asChild>
                    <Link href={session ? "/app" : "/api/auth/signin"}>
                      {session ? "Dashboard" : "Sign In with GitHub"}
                    </Link>
                  </Button>
                </div>
              </div>

              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-8">
                  <div className="mb-6">
                    <div className="mb-1 text-sm font-medium text-neutral-400">
                      Time remaining in {new Date().getFullYear()}
                    </div>
                    <div className="h-1 rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-neutral-900"
                        style={{
                          width: `${((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24) / 365) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <TimeLeft />
                </div>
              </motion.div>
            </div>
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-white via-white/30 to-transparent" />
            <div className="absolute inset-0 z-0">
              <FlickeringGrid
                squareSize={10}
                gridGap={10}
                flickerChance={0.3}
                maxOpacity={0.5}
                color="rgb(181, 199, 235)"
              />
            </div>
          </motion.header>

          <motion.section
            className="container mx-auto border-t border-neutral-200 py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TimeVisualizer />
          </motion.section>

          <motion.section
            className="container mx-auto border-t border-neutral-200 py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid gap-24 md:grid-cols-2">
              <div>
                <h2 className="mb-8 text-2xl font-medium">Essence</h2>
                <p className="leading-relaxed text-neutral-500">
                  0.todos is built on a simple truth: you have enough time to
                  make things happen. Most task managers add to your cognitive
                  load rather than reduce it. We take the opposite path.
                </p>
              </div>
              <div>
                <h2 className="mb-8 text-2xl font-medium">Principles</h2>
                <ul className="space-y-6 text-neutral-500">
                  <li className="flex gap-4">
                    <span className="text-neutral-300">01</span>
                    <span>
                      Visual simplicity — blobs represent days, revealing
                      patterns of progress
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-neutral-300">02</span>
                    <span>
                      Zero friction — no menus, no complexity, just progress
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className="text-neutral-300">03</span>
                    <span>Three states — soon, now, hold. Nothing more</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>
        </main>
        <Footer session={session} />
      </div>
    </HydrateClient>
  );
}
