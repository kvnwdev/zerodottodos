"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { api } from "@/trpc/react";

export enum TaskStatus {
  SOON = "SOON",
  NOW = "NOW",
  HOLD = "HOLD",
  COMPLETED = "COMPLETED",
}

export type Task = {
  id: string;
  content: string;
  status: TaskStatus;
  isImportant: boolean;
  position: number;
  totalPomodoros: number;
};

// Define the shape of server task data
type ServerTask = {
  id: string;
  content: string;
  status: string;
  isImportant: boolean;
  position: number;
  totalPomodoros: number;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date | null;
  userId?: string;
  completedDayId?: string | null;
};

type TaskContextType = {
  tasks: Task[];
  isLoading: boolean;
  creatingTask: boolean;
  updateTask: (id: string, data: Record<string, unknown>) => Promise<void>;
  createTask: (content: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setCreatingTask: (value: boolean) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};

export function TaskProvider({ children }: { children: ReactNode }) {
  const utils = api.useUtils();

  // Simplify the query without initialData to ensure we're getting real data from the server
  const taskQuery = api.task.getAll.useQuery();

  // Use useMemo to memoize the data to prevent unnecessary re-renders
  const data = useMemo(() => {
    return taskQuery.status === "success" ? taskQuery.data : [];
  }, [taskQuery.status, taskQuery.data]);

  const isLoading = taskQuery.status === "pending";

  // State for optimistic updates
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [creatingTask, setCreatingTask] = useState(false);

  // Task mutations
  const createTaskMutation = api.task.create.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
    },
  });

  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: (task) => {
      void utils.task.getAll.invalidate();

      // If a task has been completed, also invalidate the activity graph data
      if (task.status === "COMPLETED") {
        void utils.task.getYearActivity.invalidate();
      }
    },
  });

  const deleteTaskMutation = api.task.delete.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
    },
  });

  // Sync server data with local state
  useEffect(() => {
    if (data && Array.isArray(data)) {
      try {
        // Transform the Prisma tasks to match our local Task type
        const formattedTasks = data.map((task: ServerTask) => ({
          id: task.id,
          content: task.content,
          status: task.status as TaskStatus,
          isImportant: task.isImportant,
          position: task.position,
          totalPomodoros: task.totalPomodoros,
        }));
        setOptimisticTasks(formattedTasks);
      } catch (error) {
        console.error("Failed to format tasks:", error);
      }
    }
  }, [data]);

  // Handle task create
  const createTask = async (content: string, status: TaskStatus) => {
    setCreatingTask(true);
    try {
      const isImportant = content.startsWith("!");
      const cleanContent = isImportant ? content.substring(1).trim() : content;

      // Optimistically add the task to the UI
      const tempId = `temp-${Date.now()}`;
      const newTask: Task = {
        id: tempId,
        content: cleanContent,
        status,
        isImportant,
        // Important tasks go to the top of their group, regular tasks go below important ones
        position: 0,
        totalPomodoros: 0,
      };

      // Add to optimistic tasks
      setOptimisticTasks((prev) => [newTask, ...prev]);

      // Create on server
      await createTaskMutation.mutateAsync({
        content: cleanContent,
        status: status as unknown as "SOON" | "NOW" | "HOLD",
        isImportant,
      });
    } finally {
      setCreatingTask(false);
    }
  };

  // Handle task update
  const updateTask = async (id: string, data: Record<string, unknown>) => {
    // Immediately update in UI
    setOptimisticTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...data } : task)),
    );

    // Create a server-safe copy of the data
    const serverData = { ...data };

    // Handle TaskStatus enum conversion
    if (typeof serverData.status === "object" && serverData.status !== null) {
      // Use JSON.stringify instead of direct String conversion to get a proper representation
      const statusObj = serverData.status;
      let statusValue;

      // Try to extract the enum value from the object
      if ("_type" in statusObj) {
        statusValue = statusObj._type;
      } else if ("name" in statusObj) {
        statusValue = statusObj.name;
      } else {
        // If we can't find a proper property, try to use the object's string representation
        try {
          statusValue = JSON.stringify(statusObj).replace(/['"{}]/g, "");
        } catch {
          statusValue = TaskStatus.SOON; // Default fallback if JSON stringify fails
        }
      }

      // Validate the extracted value against TaskStatus enum
      if (Object.values(TaskStatus).includes(statusValue as TaskStatus)) {
        serverData.status = statusValue;
      } else {
        serverData.status = TaskStatus.SOON; // Default fallback
      }
    }

    // Check if we're marking a task as completed
    const isCompletingTask = serverData.status === "COMPLETED";

    // Send update to server
    await updateTaskMutation.mutateAsync({
      id,
      ...serverData,
    });

    // If task was completed using another method (like handleComplete in TaskItem),
    // manually invalidate the activity graph data
    if (isCompletingTask) {
      void utils.task.getYearActivity.invalidate();
    }
  };

  // Handle task delete
  const deleteTask = async (id: string) => {
    // Optimistically remove from UI
    setOptimisticTasks((prev) => prev.filter((task) => task.id !== id));

    // Delete on server
    await deleteTaskMutation.mutateAsync({ id });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: optimisticTasks,
        isLoading,
        creatingTask,
        updateTask,
        createTask,
        deleteTask,
        setCreatingTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
