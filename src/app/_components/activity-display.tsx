"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/trpc/react";
import { ActivityGraph } from "@/app/_components/activity-graph";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

// Define proper interfaces for our data structures
interface ActivityData {
  date: string;
  count: number;
  pomodoros: number;
}

// Interface for completed tasks
interface CompletedTask {
  id: string;
  content: string;
  isImportant: boolean;
  completedAt: Date | null;
  totalPomodoros: number;
}

// Format date string to a more natural format
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "selected date";

  try {
    // Ensure we're working with a UTC date by appending the time component
    const utcDate = new Date(dateString + "T00:00:00Z");

    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      return "invalid date";
    }

    return utcDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC", // Ensure we stay in UTC when formatting
    });
  } catch (e) {
    console.error(`Error formatting date ${dateString}:`, e);
    return "invalid date";
  }
};

export function ActivityDisplay() {
  const utils = api.useUtils();
  // Use the task router's getYearActivity method with options to ensure fresh data
  const { data: activityData } = api.task.getYearActivity.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  // Auto-close task details when clicking elsewhere in the document
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking within task details or on the activity graph
      if (
        !target.closest(".task-details-container") &&
        !target.closest(".activity-graph") &&
        showTaskDetails
      ) {
        setShowTaskDetails(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTaskDetails]);

  // Handle selecting a day in the activity graph
  const handleDaySelect = (date: string) => {
    if (date === selectedDate) {
      // Toggle task details if clicking the same date
      setShowTaskDetails(!showTaskDetails);
    } else {
      // Show task details and set new date
      setSelectedDate(date);
      setShowTaskDetails(true);
    }
  };

  // Handle closing the task details panel
  const handleCloseDetails = () => {
    setShowTaskDetails(false);
  };

  // Fetch completed tasks for the selected date using mutation
  const getTasksForDate = api.task.getCompletedTasksByDates.useMutation();

  // Use a ref to keep a stable reference to the mutation function
  const getTasksForDateRef = useRef(getTasksForDate);

  // Update the ref whenever the mutation changes
  useEffect(() => {
    getTasksForDateRef.current = getTasksForDate;
  }, [getTasksForDate]);

  // Create a stable reference to the mutation function using the ref
  const fetchTasksForDate = useCallback(
    (date: string) => {
      getTasksForDateRef.current.mutate(
        { dates: [date] },
        {
          onSuccess: (_data) => {
            // Invalidate the year activity data to ensure it's updated
            void utils.task.getYearActivity.invalidate();
          },
          onError: (error) => {
            console.error(`Error fetching tasks for ${date}:`, error);
          },
        },
      );
    },
    [utils.task],
  );

  // Effect to fetch tasks for the selected date
  useEffect(() => {
    if (selectedDate) {
      fetchTasksForDate(selectedDate);
    }
  }, [selectedDate, fetchTasksForDate]);

  // Format the activity data for the graph
  const formattedActivityData: ActivityData[] = [];

  if (Array.isArray(activityData)) {
    // Process all activity data dates
    activityData.forEach((item: ActivityData) => {
      if (item?.date && typeof item.count === "number") {
        formattedActivityData.push({
          date: item.date,
          count: item.count,
          pomodoros: item.pomodoros,
        });
      }
    });
  }

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-xl font-semibold">Activity</h2>
      <div className="activity-graph rounded-lg border border-border bg-card p-2 shadow-sm">
        <ActivityGraph
          data={formattedActivityData}
          onDaySelect={handleDaySelect}
          selectedDate={selectedDate}
        />
      </div>

      <AnimatePresence>
        {showTaskDetails && selectedDate && (
          <motion.div
            className="task-details-container relative rounded-lg border border-border bg-card p-4 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">
                Tasks completed on {formatDate(selectedDate)}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="rounded-full p-1 hover:bg-secondary"
                aria-label="Close task details"
              >
                <X size={18} />
              </button>
            </div>

            {getTasksForDate.isPending ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Loading tasks...
              </div>
            ) : getTasksForDate.data && getTasksForDate.data.length > 0 ? (
              <ScrollArea className="max-h-[400px]">
                <ul className="space-y-2 pb-1">
                  {getTasksForDate.data.map((task: CompletedTask) => (
                    <li key={task.id} className="flex items-start text-sm">
                      <span className="mr-2 text-xs text-muted-foreground">
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              // Use local timezone by default
                            })
                          : ""}
                      </span>
                      <span className={task.isImportant ? "font-medium" : ""}>
                        {task.content}
                      </span>
                      {task.totalPomodoros > 0 && (
                        <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          {task.totalPomodoros} ⏰
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No tasks completed on this day
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
