import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "terms | 0.todos",
  description: "0.todos terms of service",
};

export default function TermsPage() {
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
            terms of service
          </h1>

          <div className="prose prose-neutral dark:prose-invert prose-headings:font-medium prose-headings:tracking-tight prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-neutral-900 dark:prose-a:text-neutral-50 prose-a:underline prose-a:underline-offset-2 max-w-none">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              last updated: march 3, 2025
            </p>

            <h2 className="mt-8 text-lg">acceptance of terms</h2>
            <p>
              by accessing and using 0.todos, you agree to be bound by these
              terms of service and our privacy policy.
            </p>

            <h2 className="mt-8 text-lg">description of service</h2>
            <p>
              0.todos is a minimal task tracking application that allows users
              to:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>track tasks in three states: soon, now, and hold</li>
              <li>visualize progress through a dot system</li>
              <li>maintain a simple record of task completion</li>
            </ul>

            <h2 className="mt-8 text-lg">user accounts</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>you need a github account to use 0.todos</li>
              <li>
                you are responsible for maintaining the confidentiality of your
                account
              </li>
              <li>
                you agree to accept responsibility for all activities that occur
                under your account
              </li>
            </ul>

            <h2 className="mt-8 text-lg">intellectual property</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>
                0.todos is licensed under a non-commercial use license as
                specified in the LICENSE file
              </li>
              <li>
                the source code is available on github, but usage is restricted
                according to the license terms
              </li>
              <li>
                all trademarks, service marks, logos, and trade names are the
                property of kevin or their respective owners
              </li>
            </ul>

            <h2 className="mt-8 text-lg">user content</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>
                you retain all rights to the tasks and content you create on
                0.todos
              </li>
              <li>
                you grant us a license to store and display your content as
                necessary to provide the service
              </li>
            </ul>

            <h2 className="mt-8 text-lg">prohibited uses</h2>
            <p>you agree not to:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                use the service in any way that violates applicable laws or
                regulations
              </li>
              <li>
                attempt to gain unauthorized access to any portion of the
                service or its related systems
              </li>
              <li>use the service to distribute malware or harmful code</li>
              <li>
                interfere with or disrupt the integrity or performance of the
                service
              </li>
            </ul>

            <h2 className="mt-8 text-lg">limitation of liability</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>
                the service is provided &quot;as is&quot; without warranties of
                any kind
              </li>
              <li>
                we are not liable for any damages arising from your use of the
                service
              </li>
              <li>
                we do not guarantee that the service will be uninterrupted,
                timely, secure, or error-free
              </li>
            </ul>

            <h2 className="mt-8 text-lg">modifications to the service</h2>
            <p>
              we reserve the right to modify or discontinue, temporarily or
              permanently, the service with or without notice.
            </p>

            <h2 className="mt-8 text-lg">termination</h2>
            <p>
              we may terminate or suspend your access to the service
              immediately, without prior notice or liability, for any reason
              whatsoever.
            </p>

            <h2 className="mt-8 text-lg">governing law</h2>
            <p>
              these terms shall be governed by the laws of florida, united
              states, without regard to its conflict of law provisions.
            </p>

            <h2 className="mt-8 text-lg">changes to these terms</h2>
            <p>
              we reserve the right to update or change these terms at any time.
              we will provide notice of significant changes through the service.
            </p>

            <h2 className="mt-8 text-lg">contact us</h2>
            <p>
              if you have any questions about these terms, please contact
              kevin@kvnw.dev.
            </p>

            <p className="mt-12 text-xs text-neutral-500">
              © 2025 0.todos by kevin. all rights reserved.
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
              href="/privacy"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
