"use client";

import { motion } from "motion/react";
import { useState, useMemo } from "react";

interface ActivityGraphProps {
  data: Array<{
    date: string;
    count: number;
    pomodoros: number;
  }>;
  onDaySelect?: (date: string) => void;
  selectedDate?: string | null;
}

interface DayData {
  date: string;
  count: number;
  pomodoros: number;
  day: number;
  isToday: boolean;
}

export function ActivityGraph({
  data,
  onDaySelect,
  selectedDate,
}: ActivityGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const today = useMemo(() => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }, []);

  // Generate dates for the full 365-day period, including today
  const fullYearData: DayData[] = [];
  for (let i = 0; i <= 363; i++) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - i);
    // This will never be undefined since we're using a valid Date object
    const formattedDate = date.toISOString().split("T")[0] ?? "";

    // Get count of activities for this day
    const dayData = data?.find((d) => d.date === formattedDate);

    fullYearData.push({
      date: formattedDate,
      count: dayData?.count ?? 0,
      pomodoros: dayData?.pomodoros ?? 0,
      day: date.getUTCDay(), // 0 = Sunday, 6 = Saturday
      isToday: i === 0,
    });
  }

  // Today's data for debugging
  const todayData = fullYearData.find((d) => d.isToday);
  if (todayData) {
    console.log("Today's data:", todayData);
  }

  // Reverse the array to have oldest dates first
  fullYearData.reverse();

  // Group days into weeks for proper grid layout
  const weeks: DayData[][] = [];
  for (let i = 0; i < fullYearData.length; i += 7) {
    weeks.push(fullYearData.slice(i, i + 7));
  }

  console.log("=== Week Data ===");
  const lastWeek = weeks[weeks.length - 1];
  if (lastWeek) {
    console.log(
      "Last week's dates:",
      lastWeek.map((d) => ({
        date: d.date,
        count: d.count,
        isToday: d.isToday,
      })),
    );
  }

  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-neutral-100 dark:bg-neutral-800";

    // Task completion color scale (green)
    if (count < 3) return "bg-emerald-200 dark:bg-emerald-800";
    if (count < 5) return "bg-emerald-300 dark:bg-emerald-700";
    return "bg-emerald-400 dark:bg-emerald-600";
  };

  const handleDayClick = (date: string) => {
    if (onDaySelect) {
      onDaySelect(date);
    }
  };

  // Calculate tooltip content and position
  const tooltipInfo = useMemo(() => {
    if (!hoveredDay) return null;

    const date = new Date(hoveredDay + "T00:00:00.000Z");

    // Find the data for this day
    const dayData = data.find((d) => d.date === hoveredDay);

    return {
      dayLabel: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC", // Force UTC to match our data
      }),
      countLabel: dayData?.count ?? 0,
      pomodoroLabel: dayData?.pomodoros ?? 0,
      position: {
        x: date.getUTCHours() * 24 + date.getUTCMinutes() / 2,
        y: date.getUTCDate() - today.getUTCDate() + 1,
      },
      date,
    };
  }, [hoveredDay, data, today]);

  return (
    <div className="relative">
      {hoveredDay && (
        <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-neutral-900">
          <span className="block text-center">
            {tooltipInfo && (
              <>
                {tooltipInfo.dayLabel} • {tooltipInfo.countLabel} tasks
              </>
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-[repeat(53,1fr)] gap-1 overflow-hidden p-2">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const isSelected = selectedDate === day.date;

            // Log today's rendering
            if (day.isToday) {
              console.log(
                `TODAY RENDERING: ${day.date}, tasks: ${day.count}, pomodoros: ${day.pomodoros}, selected: ${isSelected}`,
              );
            }

            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={`aspect-square w-full cursor-pointer rounded-sm ${getColorForCount(day.count)} ${isSelected ? "ring-2 ring-emerald-500 dark:ring-emerald-400" : ""} `}
                style={{
                  gridColumn: weekIndex + 1,
                  gridRow: dayIndex + 1,
                }}
                whileHover={{ scale: 1.2 }}
                onClick={() => handleDayClick(day.date)}
                onMouseEnter={() => setHoveredDay(day.date)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
