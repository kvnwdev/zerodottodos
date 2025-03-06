"use client";

import { TaskItem } from "./task-item";
import { TaskInput } from "./task-input";
import { useTaskContext, TaskStatus, type Task } from "./task-context";

// Define column structure for the UI
const statusColumns = [
  { status: TaskStatus.SOON, title: "soon" },
  { status: TaskStatus.NOW, title: "now" },
  { status: TaskStatus.HOLD, title: "hold" },
];

export function TaskManagement() {
  const {
    tasks: optimisticTasks,
    isLoading,
    updateTask: handleTaskUpdate,
    deleteTask: handleTaskDelete,
    createTask: handleTaskCreate,
  } = useTaskContext();

  // Helper function to render a column of tasks
  const renderTaskList = (status: TaskStatus, taskList: Task[]) => {
    const filteredTasks = taskList
      .filter((task) => task.status === status)
      // Sort important tasks to the top, then by position
      .sort((a, b) => {
        // First sort by importance (important tasks first)
        if (a.isImportant && !b.isImportant) return -1;
        if (!a.isImportant && b.isImportant) return 1;
        // Then sort by position
        return a.position - b.position;
      });

    return (
      <div className="min-h-[100px] flex-1">
        <h2 className="mb-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {status.toLowerCase()}
        </h2>
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              id={task.id}
              content={task.content}
              status={task.status}
              isImportant={task.isImportant}
              totalPomodoros={task.totalPomodoros}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
            />
          ))}
          {status !== TaskStatus.COMPLETED && filteredTasks.length === 0 && (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-2 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500">
              no tasks
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading tasks...</div>;
  }

  return (
    <div className="flex flex-col">
      {/* Task input area */}
      <TaskInput onTaskCreate={handleTaskCreate} />

      {/* Task columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statusColumns.map((column) => (
          <div key={column.status} className="flex flex-col">
            {renderTaskList(column.status, optimisticTasks)}
          </div>
        ))}
      </div>
    </div>
  );
}
