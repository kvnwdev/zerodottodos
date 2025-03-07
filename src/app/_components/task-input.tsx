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
  const [isMac, setIsMac] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect OS on component mount
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMac(!userAgent.includes("win"));
  }, []);

  // Command+Enter or Ctrl+Enter to focus the input based on OS
  useHotkeys(isMac ? "meta+enter" : "ctrl+enter", (e) => {
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
    // Check for Enter with either meta key (Mac) or ctrl key (Windows)
    if (
      e.key === "Enter" &&
      !((isMac && e.metaKey) || (!isMac && e.ctrlKey)) &&
      !e.shiftKey
    ) {
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
          className="w-full border-b border-input bg-transparent p-2 pr-24 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {(isImportant || input.includes("/")) && (
          <div className="absolute right-0 top-2 flex items-center gap-1 text-xs text-muted-foreground">
            {isImportant && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                important
              </span>
            )}
            {input.includes("/") && (
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                {getStatusLabel(targetStatus)}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          <kbd className="hidden rounded border border-border bg-secondary px-1 py-0.5 font-mono text-xs md:inline-block">
            {isMac ? "⌘" : "Ctrl"} + Enter
          </kbd>
          <span className="ml-1 hidden md:inline-block"> to focus</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">!</span> for important
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">/n</span> for now
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">/h</span> for hold
          </span>
        </div>
      </div>
    </div>
  );
}
