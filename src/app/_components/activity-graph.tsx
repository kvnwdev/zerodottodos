"use client";

import { motion } from "motion/react";
import { useState } from "react";
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
  isToday: boolean;
}

export function ActivityGraph({
  data,
  onDaySelect,
  selectedDate,
}: ActivityGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Generate dates for the activity graph
  const today = new Date();
  // Reset the time to midnight to ensure consistent date comparisons
  today.setHours(0, 0, 0, 0);
  // Add one day to correct for timezone offset
  today.setDate(today.getDate() + 1);

  console.log(`Today is: ${today.toISOString()}`);

  // Generate dates for the full 365-day period, including today
  const fullYearData: DayData[] = [];
  for (let i = 0; i <= 363; i++) {
    const date = new Date(today);
    // Go backwards from today
    date.setDate(today.getDate() - i);
    const countDate = new Date(date);
    countDate.setDate(countDate.getDate() - 1);

    // Format date as YYYY-MM-DD for consistent comparison
    const formattedDate = formatDateToYYYYMMDD(date);
    const formattedCountDate = formatDateToYYYYMMDD(countDate);

    // Get count of activities for this day
    const count = data.find((d) => d.date === formattedCountDate)?.count ?? 0;

    if (i < 7) {
      console.log(
        `Generating day for ${formattedDate}, count: ${count}, isToday: ${i === 0}`,
      );
    }

    fullYearData.push({
      date: formattedDate,
      count,
      day: date.getDay(),
      isToday: i === 0,
    });
  }

  // Reverse the array to have oldest dates first
  fullYearData.reverse();

  // Group days into weeks for proper grid layout
  const weeks: DayData[][] = [];
  for (let i = 0; i < fullYearData.length; i += 7) {
    weeks.push(fullYearData.slice(i, i + 7));
  }

  console.log(
    `Generated ${weeks.length} weeks with ${fullYearData.length} days total`,
  );
  console.log(
    `First day: ${fullYearData[0]?.date}, Last day: ${fullYearData[fullYearData.length - 1]?.date}`,
  );

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
            {(() => {
              // Fix date offset by adding a day
              const date = new Date(hoveredDay);
              date.setDate(date.getDate()); // Add one day to correct the offset
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            })()}
          </span>
        </div>
      )}

      <div className="grid grid-cols-[repeat(53,1fr)] gap-1 overflow-hidden">
        {weeks.map((week, weekIndex) => {
          // Log the last couple of weeks for debugging
          if (weekIndex >= weeks.length - 2) {
            console.log(
              `Week ${weekIndex}: ${JSON.stringify(week.map((d) => d.date))}`,
            );
          }

          return week.map((day, dayIndex) => {
            const isSelected = selectedDate === day.date;

            // Log today's rendering
            if (day.isToday) {
              console.log(
                `TODAY RENDERING: ${day.date}, count: ${day.count}, selected: ${isSelected}`,
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
          });
        })}
      </div>
    </div>
  );
}

// Format a date object to YYYY-MM-DD string
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  // Month is 0-based, so add 1 and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, "0");
  // Day of month, pad with leading zero if needed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
