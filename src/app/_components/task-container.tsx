"use client";

import { useState, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskItem } from "./task-item";

// Define TaskStatus enum locally until Prisma client is generated
enum TaskStatus {
  SOON = "SOON",
  NOW = "NOW",
  HOLD = "HOLD",
}

type Task = {
  id: string;
  content: string;
  status: TaskStatus;
  isImportant: boolean;
  position: number;
};

interface TaskContainerProps {
  tasks: Task[];
  onTaskCreate: (content: string, status: TaskStatus) => void;
  onTaskUpdate: (
    id: string,
    data: {
      content?: string;
      status?: TaskStatus;
      isImportant?: boolean;
      position?: number;
    },
  ) => void;
  onTaskDelete: (id: string) => void;
}

export function TaskContainer({
  tasks,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}: TaskContainerProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [inputValues, setInputValues] = useState<Record<TaskStatus, string>>({
    [TaskStatus.SOON]: "",
    [TaskStatus.NOW]: "",
    [TaskStatus.HOLD]: "",
  });

  const inputRefs = {
    [TaskStatus.SOON]: useRef<HTMLInputElement>(null),
    [TaskStatus.NOW]: useRef<HTMLInputElement>(null),
    [TaskStatus.HOLD]: useRef<HTMLInputElement>(null),
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(tasks, oldIndex, newIndex);

        // Update positions for all affected tasks
        newTasks.forEach((task, index) => {
          if (task.position !== index) {
            onTaskUpdate(task.id, { position: index });
          }
        });
      }
    }
  };

  const handleInputChange = (status: TaskStatus, value: string) => {
    setInputValues((prev) => ({ ...prev, [status]: value }));
  };

  const handleInputKeyDown = (
    e: ReactKeyboardEvent<HTMLInputElement>,
    status: TaskStatus,
  ) => {
    if (e.key === "Enter" && inputValues[status].trim() !== "") {
      // Create a new task
      onTaskCreate(inputValues[status], status);
      // Clear the input
      setInputValues((prev) => ({ ...prev, [status]: "" }));
    } else if (e.key === "/" && inputValues[status] === "") {
      // Toggle importance for the last task in this status
      const lastTask = [...tasks]
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position)
        .pop();

      if (lastTask) {
        onTaskUpdate(lastTask.id, { isImportant: !lastTask.isImportant });
      }
      e.preventDefault();
    }
  };

  // Filter and sort tasks by status and position
  const soonTasks = tasks
    .filter((task) => task.status === TaskStatus.SOON)
    .sort((a, b) => a.position - b.position);

  const nowTasks = tasks
    .filter((task) => task.status === TaskStatus.NOW)
    .sort((a, b) => a.position - b.position);

  const holdTasks = tasks
    .filter((task) => task.status === TaskStatus.HOLD)
    .sort((a, b) => a.position - b.position);

  const renderTaskList = (status: TaskStatus, taskList: Task[]) => {
    return (
      <div className="min-w-0 flex-1">
        <div className="mb-2 text-xs font-medium text-neutral-500">
          {status.toLowerCase()}
        </div>

        <div className="mb-2">
          <input
            ref={inputRefs[status]}
            type="text"
            placeholder="+ new task"
            className="w-full border-b border-neutral-200 bg-transparent p-1 text-sm outline-none"
            value={inputValues[status]}
            onChange={(e) => handleInputChange(status, e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e, status)}
          />
        </div>

        <SortableContext
          items={taskList.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {taskList.map((task) => (
              <TaskItem
                key={task.id}
                id={task.id}
                content={task.content}
                status={task.status}
                isImportant={task.isImportant}
                onUpdate={onTaskUpdate}
                onDelete={onTaskDelete}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4">
        {renderTaskList(TaskStatus.SOON, soonTasks)}
        {renderTaskList(TaskStatus.NOW, nowTasks)}
        {renderTaskList(TaskStatus.HOLD, holdTasks)}
      </div>

      {/* Drag overlay for showing task while dragging */}
      <DragOverlay>
        {activeTask && (
          <div className="rounded-sm border border-neutral-400 bg-white p-2 text-sm shadow-md">
            {activeTask.isImportant && (
              <span className="mr-1 text-neutral-500">!</span>
            )}
            {activeTask.content}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
