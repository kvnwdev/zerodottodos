import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/app/_components/theme-provider";
import { PomodoroProvider } from "@/app/_components/pomodoro/pomodoro-context";
import { MdrGridOverlay } from "@/app/_components/mdr-grid-overlay";

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
                  if (theme === 'mdr') {
                    document.documentElement.classList.add('mdr');
                  } else if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark', 'mdr');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <TRPCReactProvider>
          <ThemeProvider>
            <PomodoroProvider>
              <MdrGridOverlay />
              {children}
            </PomodoroProvider>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
