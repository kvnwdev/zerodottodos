"use client";

import { useEffect, useState } from "react";
import { NumberTicker } from "../number-ticker";

export function TimeLeft() {
  const [timeLeft, setTimeLeft] = useState({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      const difference = endOfYear.getTime() - now.getTime();

      const weeks = Math.floor(difference / (1000 * 60 * 60 * 24 * 7));
      const days = Math.floor((difference / (1000 * 60 * 60 * 24)) % 7);
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ weeks, days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-8">
      {[
        { value: timeLeft.weeks, label: "weeks" },
        {
          value: timeLeft.days,
          label: "day" + (timeLeft.days === 1 ? "" : "s"),
        },
        {
          value: timeLeft.hours,
          label: "hour" + (timeLeft.hours === 1 ? "" : "s"),
        },
        {
          value: timeLeft.minutes,
          label: "minute" + (timeLeft.minutes === 1 ? "" : "s"),
        },
        {
          value: timeLeft.seconds,
          label: "second" + (timeLeft.seconds === 1 ? "" : "s"),
        },
      ].map(
        ({ value, label }) =>
          value > 0 && (
            <div key={label} className="text-center">
              <div className="mb-2 text-3xl font-medium md:text-5xl">
                <NumberTicker value={value} className="text-neutral-900" />
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-400 md:text-sm">
                {label}
              </div>
            </div>
          ),
      )}
    </div>
  );
}
