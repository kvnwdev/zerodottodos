"use client";

import { type ReactNode } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { TaskItem } from "./task-item";

// Use the same enum as in task-management.tsx
enum TaskStatus {
  SOON = "SOON",
  NOW = "NOW",
  HOLD = "HOLD",
  COMPLETED = "COMPLETED",
}

// Task interface for local state management
type Task = {
  id: string;
  content: string;
  status: TaskStatus;
  isImportant: boolean;
  position: number;
};

interface TaskColumnProps {
  id: string;
  status: TaskStatus;
  title: string;
  tasks: Task[];
  isDraggingOver?: boolean;
  onTaskUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onTaskDelete: (id: string) => Promise<void>;
  children?: ReactNode;
}

export function TaskColumn({
  id,
  status: _status,
  title,
  tasks,
  isDraggingOver = false,
  onTaskUpdate,
  onTaskDelete,
  children,
}: TaskColumnProps) {
  // Setup droppable area
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="bg-card flex h-full flex-col rounded-lg border p-3 shadow-sm">
      <h3 className="text-foreground mb-3 font-medium">{title}</h3>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-md p-2 transition-colors ${
          isDraggingOver
            ? "bg-neutral-100/80 dark:bg-neutral-800/80"
            : "bg-transparent"
        }`}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={rectSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                content={task.content}
                isImportant={task.isImportant}
                status={task.status}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
              />
            ))
          ) : (
            <div className="text-muted-foreground mt-2 text-center text-sm">
              no tasks
            </div>
          )}
        </SortableContext>
      </div>

      {/* Task input or other children */}
      <div className="mt-3">{children}</div>
    </div>
  );
}
