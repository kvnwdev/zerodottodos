"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Help"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg lowercase">
            how to use 0.todos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          <section>
            <h3 className="mb-2 font-medium">core philosophy</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              this app is intentionally minimal. we focus on productivity, not
              gimmicks.
            </p>
          </section>

          <section>
            <h3 className="mb-2 font-medium">keyboard shortcuts</h3>
            <div className="flex flex-col gap-y-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
              <p>
                <span className="inline-block rounded bg-neutral-100 px-2 py-1 font-mono text-xs dark:bg-neutral-800">
                  cmd/ctrl + enter
                </span>
                <span className="ml-2">focus the task creation input</span>
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-medium">creating tasks</h3>
            <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <p>start typing what you have to do in the input field.</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>
                  <span className="font-mono">!</span> at the beginning marks a
                  task as important
                </li>
                <li>
                  add a flag to set the state:
                  <ul className="ml-5 list-disc">
                    <li>
                      <span className="font-mono">/s</span> - soon (backlog)
                    </li>
                    <li>
                      <span className="font-mono">/n</span> - now (doing)
                    </li>
                    <li>
                      <span className="font-mono">/w</span> - watch (on hold)
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-medium">managing tasks</h3>
            <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <p>hover over a task to see available actions:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>
                  press <span className="font-mono">m</span> to move it to
                  another state
                </li>
                <li>press the check to complete it</li>
                <li>press the trashcan to delete it</li>
                <li>double click to rename the task</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-medium">pomodoro timer</h3>
            <div className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <p>the timer at the top follows the pomodoro technique:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>press start to begin your 25-minute work session</li>
                <li>
                  when the timer finishes, you can assign it to the task you
                  were working on
                </li>
                <li>
                  you can either skip your 5-minute break or start it and be
                  notified when it&apos;s over
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-center">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
