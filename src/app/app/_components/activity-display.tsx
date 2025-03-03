"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { ActivityGraph } from "@/app/_components/activity-graph";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

// Define proper interfaces for our data structures
interface ActivityData {
  date: string;
  count: number;
}

// Interface for completed tasks
interface CompletedTask {
  id: string;
  content: string;
  isImportant: boolean;
  completedAt: Date | null;
}

// Format date string to a more natural format
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "selected date";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export function ActivityDisplay() {
  // Use the task router's getYearActivity method instead of completedDay router
  const { data: activityData } = api.task.getYearActivity.useQuery();
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

  // Effect to fetch tasks for the selected date
  useEffect(() => {
    if (selectedDate) {
      getTasksForDate.mutate({ dates: [selectedDate] });
    }
  }, [selectedDate, getTasksForDate]);

  // Format the activity data for the graph
  const formattedActivityData: ActivityData[] = [];

  if (Array.isArray(activityData)) {
    activityData.forEach((item: ActivityData) => {
      if (item?.date && typeof item.count === "number") {
        formattedActivityData.push({
          date: item.date,
          count: item.count,
        });
      }
    });
  }

  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-xl font-semibold">Activity</h2>
      <div className="activity-graph bg-card rounded-lg border p-4 shadow-sm">
        <ActivityGraph
          data={formattedActivityData}
          onDaySelect={handleDaySelect}
          selectedDate={selectedDate}
        />
      </div>

      <AnimatePresence>
        {showTaskDetails && selectedDate && (
          <motion.div
            className="task-details-container bg-card relative rounded-lg border p-4 shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Tasks completed on {formatDate(selectedDate)}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="hover:bg-muted rounded-full p-1"
                aria-label="Close task details"
              >
                <X size={18} />
              </button>
            </div>

            <ScrollArea className="h-[200px]">
              {getTasksForDate.isPending ? (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  Loading tasks...
                </div>
              ) : getTasksForDate.data && getTasksForDate.data.length > 0 ? (
                <ul className="space-y-2">
                  {getTasksForDate.data.map((task: CompletedTask) => (
                    <li key={task.id} className="flex items-start text-sm">
                      <span className="mr-2 text-xs text-neutral-400">
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                      <span className={task.isImportant ? "font-medium" : ""}>
                        {task.content}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  No tasks completed on this day.
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
