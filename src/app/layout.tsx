import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/app/_components/theme-provider";
import { PomodoroProvider } from "@/app/_components/pomodoro/pomodoro-context";

export const metadata: Metadata = {
  title: "0.todos | minimal task tracking",
  description: "task tracker that gets out of your way",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* This script prevents theme flash on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 transition-colors duration-200 dark:bg-neutral-900 dark:text-neutral-50">
        <TRPCReactProvider>
          <ThemeProvider>
            <PomodoroProvider>{children}</PomodoroProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
