import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "privacy | 0.todos",
  description: "0.todos privacy policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-[system-ui] text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-50">
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <Link
            href="/"
            className="text-sm font-medium hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            0.todos
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex-1 px-4 pb-16 pt-32">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-12 text-2xl font-medium tracking-tight">
            privacy policy
          </h1>

          <div className="prose prose-neutral dark:prose-invert prose-headings:font-medium prose-headings:tracking-tight prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-neutral-900 dark:prose-a:text-neutral-50 prose-a:underline prose-a:underline-offset-2 max-w-none">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              last updated: march 3, 2025
            </p>

            <h2 className="mt-8 text-lg">introduction</h2>
            <p>
              welcome to 0.todos. we respect your privacy and are committed to
              protecting your personal data. this privacy policy explains how we
              collect, use, and safeguard your information when you use our
              service.
            </p>

            <h2 className="mt-8 text-lg">who we are</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>application name</strong>: 0.todos (zerodottodos)
              </li>
              <li>
                <strong>owner/developer</strong>: kevin willoughby
              </li>
              <li>
                <strong>contact</strong>: kevin@kvnw.dev
              </li>
            </ul>

            <h2 className="mt-8 text-lg">information we collect</h2>
            <p>
              in keeping with our minimalist philosophy, we collect only
              what&apos;s necessary:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>
                <strong>account information</strong>: when you sign up using
                github authentication, we receive your github username, profile
                picture, and email address.
              </li>
              <li>
                <strong>task data</strong>: the tasks you create and their
                status (soon, now, hold) and completion records.
              </li>
              <li>
                <strong>usage data</strong>: basic analytics about how you
                interact with the application to improve user experience.
              </li>
            </ol>

            <h2 className="mt-8 text-lg">how we use your information</h2>
            <p>we use your data in the following ways:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>to provide and maintain our service</li>
              <li>to authenticate you via github</li>
              <li>to save and sync your tasks across devices</li>
              <li>
                to monitor and improve the performance and features of 0.todos
              </li>
            </ul>

            <h2 className="mt-8 text-lg">data storage and security</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>
                your data is stored in our database managed through prisma
              </li>
              <li>
                we implement reasonable security measures to protect your
                personal information
              </li>
              <li>we do not sell your personal data to third parties</li>
            </ul>

            <h2 className="mt-8 text-lg">third-party services</h2>
            <p>0.todos uses the following third-party services:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>github oauth</strong>: for authentication
              </li>
              <li>
                <strong>vercel</strong>: for hosting and deployment
              </li>
              <li>
                <strong>database provider</strong>: for storing your task data
              </li>
            </ul>
            <p>
              each third-party service has its own privacy policy governing the
              information they process.
            </p>

            <h2 className="mt-8 text-lg">your rights</h2>
            <p>you have the right to:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>access the personal data we hold about you</li>
              <li>request correction of your personal data</li>
              <li>request deletion of your data</li>
              <li>export your task data</li>
              <li>withdraw consent at any time</li>
            </ul>

            <h2 className="mt-8 text-lg">cookies and tracking</h2>
            <p>
              we use minimal cookies that are necessary for the functioning of
              the application, particularly for maintaining your session state
              and authentication.
            </p>

            <h2 className="mt-8 text-lg">changes to this privacy policy</h2>
            <p>
              we may update our privacy policy from time to time. we will notify
              you of any changes by posting the new privacy policy on this page
              and updating the &quot;last updated&quot; date.
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto border-t border-neutral-200 py-8 dark:border-neutral-800">
        <div className="container mx-auto flex items-center justify-center px-4">
          <div className="flex gap-8 text-sm text-neutral-400">
            <Link
              href="/"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              home
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
