"use client";

import { usePomodoro } from "./pomodoro-context";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { TaskSelector } from "./task-selector";

export function PomodoroTimer() {
  const {
    state,
    startPomodoro,
    pausePomodoro,
    skipBreak,
    assignTaskToLastSession,
  } = usePomodoro();
  const workSoundRef = useRef<HTMLAudioElement | null>(null);
  const breakSoundRef = useRef<HTMLAudioElement | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    workSoundRef.current = new Audio("/notification-simple.wav");
    breakSoundRef.current = new Audio("/alert-high.wav");
  }, []);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Play sound when timer completes and show task selector for work sessions
  useEffect(() => {
    if (state.timeRemaining === 0) {
      const sound =
        state.type === "WORK" ? workSoundRef.current : breakSoundRef.current;
      sound
        ?.play()
        .catch((error) => console.error("Error playing sound:", error));

      if (state.type === "WORK") {
        setShowTaskSelector(true);
      }
    }
  }, [state.timeRemaining, state.type]);

  const handleTaskSelect = (taskId: string) => {
    assignTaskToLastSession(taskId);
    setShowTaskSelector(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="font-mono text-sm text-primary">
          {formatTime(state.timeRemaining)}
          {state.isFastMode && (
            <span className="ml-2 text-xs text-accent">fast</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-secondary"
          onClick={() => {
            if (state.isActive) {
              pausePomodoro();
            } else {
              startPomodoro();
            }
          }}
        >
          {state.isActive
            ? "pause"
            : state.type === "WORK"
              ? "start"
              : "start break"}
        </Button>
        {state.type === "BREAK" && !state.isActive && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-secondary"
            onClick={skipBreak}
          >
            skip
          </Button>
        )}
      </div>

      <TaskSelector
        isOpen={showTaskSelector}
        onClose={() => setShowTaskSelector(false)}
        onSelect={handleTaskSelect}
      />
    </>
  );
}
