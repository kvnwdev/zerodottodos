"use client";

import { type KeyboardEvent, useRef, useState, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useTaskContext, TaskStatus } from "./task-context";

interface TaskInputProps {
  onTaskCreate?: (content: string, status: TaskStatus) => void;
}

export function TaskInput({ onTaskCreate }: TaskInputProps = {}) {
  const { createTask } = useTaskContext();
  const [input, setInput] = useState("");
  const [targetStatus, setTargetStatus] = useState<TaskStatus>(TaskStatus.SOON);
  const [isImportant, setIsImportant] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command+Enter to focus the input
  useHotkeys("meta+enter", (e) => {
    e.preventDefault();
    inputRef.current?.focus();
  });

  // Live command detection
  useEffect(() => {
    // Reset markers on each input change
    setIsImportant(false);
    setTargetStatus(TaskStatus.SOON);

    const updatedInput = input;

    // Check for importance marker
    if (updatedInput.startsWith("!")) {
      setIsImportant(true);
    }

    // Check for status commands
    if (updatedInput.includes("/s")) {
      setTargetStatus(TaskStatus.SOON);
    } else if (updatedInput.includes("/n")) {
      setTargetStatus(TaskStatus.NOW);
    } else if (updatedInput.includes("/h")) {
      setTargetStatus(TaskStatus.HOLD);
    }
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.metaKey && !e.shiftKey) {
      e.preventDefault();

      // Get the input content
      const trimmedInput = input.trim();

      if (trimmedInput !== "") {
        // Check for importance marker
        const isTaskImportant = trimmedInput.startsWith("!");

        // Remove ! and command flags for the actual content
        let cleanedInput = trimmedInput
          .replace(/\/[snh]/g, "") // Remove status commands
          .trim();

        // Remove the ! prefix from the content but keep track of importance
        if (isTaskImportant) {
          cleanedInput = cleanedInput.replace(/^![ ]?/, "");
        }

        // Use either the prop function or context createTask
        if (onTaskCreate) {
          onTaskCreate(cleanedInput, targetStatus);
        } else {
          void createTask(cleanedInput, targetStatus);
        }

        setInput("");
      }
    }
  };

  // Helper to get status label
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.SOON:
        return "soon";
      case TaskStatus.NOW:
        return "now";
      case TaskStatus.HOLD:
        return "hold";
    }
  };

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="add a new task..."
          className="w-full border-b border-neutral-200 bg-transparent p-2 pr-24 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-300 dark:border-neutral-800 dark:placeholder:text-neutral-600 dark:focus:border-neutral-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {(isImportant || input.includes("/")) && (
          <div className="absolute right-0 top-2 flex items-center gap-1 text-xs text-neutral-400">
            {isImportant && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                important
              </span>
            )}
            {input.includes("/") && (
              <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {getStatusLabel(targetStatus)}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
        <div>
          <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 font-mono text-xs dark:border-neutral-800 dark:bg-neutral-900">
            ⌘ + Enter
          </kbd>{" "}
          to focus
        </div>
        <div className="flex gap-2">
          <span className="text-neutral-400 dark:text-neutral-500">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              !
            </span>{" "}
            for important
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              /n
            </span>{" "}
            for now
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              /h
            </span>{" "}
            for hold
          </span>
        </div>
      </div>
    </div>
  );
}
