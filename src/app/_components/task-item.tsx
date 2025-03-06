"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Check, Trash, Star } from "lucide-react";
import { useTaskContext, TaskStatus } from "./task-context";
import { api } from "@/trpc/react";

interface TaskItemProps {
  id: string;
  content: string;
  isImportant: boolean;
  status: TaskStatus;
  totalPomodoros?: number;
  onUpdate?: (
    id: string,
    data: {
      content?: string;
      isImportant?: boolean;
      status?: TaskStatus;
      position?: number;
    },
  ) => void;
  onDelete?: (id: string) => void;
}

export function TaskItem({
  id,
  content,
  isImportant,
  status,
  totalPomodoros = 0,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const { updateTask, deleteTask } = useTaskContext();
  const utils = api.useUtils();
  const [isHovered, setIsHovered] = useState(false);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end of text
      inputRef.current.selectionStart = inputRef.current.value.length;
    }
  }, [isEditing]);

  // Get available target statuses based on current status
  const getTargetStatuses = () => {
    switch (status) {
      case TaskStatus.SOON:
        return [
          { status: TaskStatus.NOW, label: "N" },
          { status: TaskStatus.HOLD, label: "H" },
        ];
      case TaskStatus.NOW:
        return [
          { status: TaskStatus.SOON, label: "S" },
          { status: TaskStatus.HOLD, label: "H" },
        ];
      case TaskStatus.HOLD:
        return [
          { status: TaskStatus.SOON, label: "S" },
          { status: TaskStatus.NOW, label: "N" },
        ];
      default:
        return [];
    }
  };

  const handleComplete = () => {
    if (onUpdate) {
      onUpdate(id, { status: TaskStatus.COMPLETED });
    } else {
      void updateTask(id, { status: TaskStatus.COMPLETED });
    }

    // Invalidate the activity data when a task is completed
    void utils.task.getYearActivity.invalidate();
  };

  const handleToggleImportant = () => {
    if (onUpdate) {
      onUpdate(id, { isImportant: !isImportant });
    } else {
      void updateTask(id, { isImportant: !isImportant });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    } else {
      void deleteTask(id);
    }
  };

  const handleMove = (targetStatus: TaskStatus) => {
    if (onUpdate) {
      onUpdate(id, { status: targetStatus });
    } else {
      void updateTask(id, { status: targetStatus });
    }
    setShowMoveOptions(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editContent.trim()) {
        if (onUpdate) {
          onUpdate(id, { content: editContent.trim() });
        } else {
          void updateTask(id, { content: editContent.trim() });
        }
        setIsEditing(false);
      }
    } else if (e.key === "Escape") {
      setEditContent(content);
      setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2 shadow-sm transition-colors dark:border-neutral-700 dark:bg-neutral-800`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMoveOptions(false);
      }}
      onDoubleClick={!isEditing ? handleDoubleClick : undefined}
    >
      {/* Importance indicator */}
      <button
        onClick={handleToggleImportant}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
          isImportant
            ? "text-amber-500 hover:text-amber-600"
            : "text-neutral-300 hover:text-amber-500 dark:text-neutral-500 dark:hover:text-amber-400"
        }`}
      >
        <Star
          className="h-4 w-4"
          fill={isImportant ? "currentColor" : "none"}
        />
      </button>

      {/* Task content */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (editContent.trim()) {
              if (onUpdate) {
                onUpdate(id, { content: editContent.trim() });
              } else {
                void updateTask(id, { content: editContent.trim() });
              }
            }
            setIsEditing(false);
          }}
          className="flex-1 border-b border-neutral-300 bg-transparent text-sm focus:border-neutral-500 focus:outline-none dark:border-neutral-600 dark:focus:border-neutral-400"
          autoComplete="off"
        />
      ) : (
        <p className={`flex-1 text-sm ${isImportant ? "font-medium" : ""}`}>
          {content}
          {totalPomodoros > 0 && (
            <span className="ml-2 text-neutral-500 dark:text-neutral-400">
              {totalPomodoros} ⏰
            </span>
          )}
        </p>
      )}

      {/* Action buttons */}
      <div
        className={`flex gap-1 transition-opacity ${
          isHovered && !isEditing ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Move button */}
        {!showMoveOptions ? (
          <button
            onClick={() => setShowMoveOptions(true)}
            className="rounded p-1 text-neutral-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-400"
            title="Move task"
          >
            <span className="font-medium">M</span>
          </button>
        ) : (
          // Status options when "M" is clicked
          getTargetStatuses().map((targetStatus) => (
            <button
              key={targetStatus.status}
              onClick={() => handleMove(targetStatus.status)}
              className="rounded p-1 font-medium text-neutral-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-400"
              title={`Move to ${targetStatus.status.toLowerCase()}`}
            >
              {targetStatus.label}
            </button>
          ))
        )}

        <button
          onClick={handleComplete}
          className="rounded p-1 text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900 dark:hover:text-emerald-400"
          title="Mark as completed"
        >
          <Check className="h-4 w-4" />
        </button>

        <button
          onClick={handleDelete}
          className="rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
          title="Delete task"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
