"use client";

import { useEffect, useState } from "react";
import { NumberTicker } from "../number-ticker";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
      );
      const difference = endOfDay.getTime() - now.getTime();

      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-1">
      <div className="flex gap-8">
        <div className="space-y-1">
          <div className="text-xl font-medium tabular-nums">
            <NumberTicker value={timeLeft.hours} />
          </div>
          <div className="text-sm font-medium text-neutral-400">
            {timeLeft.hours === 0
              ? ""
              : "Hour" + (timeLeft.hours === 1 ? "" : "s")}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl font-medium tabular-nums">
            <NumberTicker value={timeLeft.minutes} />
          </div>
          <div className="text-sm font-medium text-neutral-400">
            {timeLeft.minutes === 0
              ? ""
              : "Minute" + (timeLeft.minutes === 1 ? "" : "s")}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xl font-medium tabular-nums">
            <NumberTicker value={timeLeft.seconds} />
          </div>
          <div className="text-sm font-medium text-neutral-400">
            {timeLeft.seconds === 0
              ? ""
              : "Second" + (timeLeft.seconds === 1 ? "" : "s")}
          </div>
        </div>
      </div>
    </div>
  );
}
