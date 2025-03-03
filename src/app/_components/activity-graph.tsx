"use client";

import { motion } from "motion/react";
import { useState, useMemo } from "react";

interface ActivityGraphProps {
  data: {
    date: string;
    count: number;
  }[];
  onDaySelect?: (date: string) => void;
  selectedDate?: string | null;
}

interface DayData {
  date: string;
  count: number;
  day: number;
}

export function ActivityGraph({
  data,
  onDaySelect,
  selectedDate,
}: ActivityGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Generate a full year of dates regardless of whether there's data
  const fullYearData = useMemo(() => {
    const dates: DayData[] = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      // Format the date as YYYY-MM-DD
      // Ensure it's always a string by adding empty string fallback
      const dateStr = date.toISOString().split("T")[0] ?? "";

      // Find matching data if it exists
      const existingData = data.find((d) => d.date === dateStr);

      dates.push({
        date: dateStr,
        count: existingData ? existingData.count : 0,
        day: date.getDay(),
      });
    }

    // Group by week (7 days per row)
    const weeks: DayData[][] = [];
    for (let i = 0; i < dates.length; i += 7) {
      weeks.push(dates.slice(i, i + 7));
    }

    return weeks;
  }, [data]);

  const getColorForCount = (count: number) => {
    if (count === 0) return "bg-neutral-100 dark:bg-neutral-800";
    if (count < 3) return "bg-emerald-200 dark:bg-emerald-800";
    if (count < 5) return "bg-emerald-300 dark:bg-emerald-700";
    return "bg-emerald-400 dark:bg-emerald-600";
  };

  const handleDayClick = (date: string) => {
    if (onDaySelect) {
      onDaySelect(date);
    }
  };

  return (
    <div className="relative">
      {hoveredDay && (
        <div className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-neutral-900 px-2 py-1 text-xs text-white dark:bg-white dark:text-neutral-900">
          <span className="block text-center">
            {new Date(hoveredDay).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-[repeat(53,1fr)] gap-1 overflow-hidden">
        {fullYearData.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const isSelected = selectedDate === day.date;
            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={`aspect-square w-full cursor-pointer rounded-sm ${getColorForCount(day.count)} ${isSelected ? "ring-2 ring-emerald-500 dark:ring-emerald-400" : ""} `}
                style={{
                  gridColumn: weekIndex + 1,
                  gridRow: dayIndex + 1,
                }}
                whileHover={{ scale: 1.2 }}
                onHoverStart={() => setHoveredDay(day.date)}
                onHoverEnd={() => setHoveredDay(null)}
                onClick={() => handleDayClick(day.date)}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
