"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from "react";
import { api } from "@/trpc/react";

type PomodoroType = "WORK" | "BREAK";

interface PomodoroState {
  isActive: boolean;
  type: PomodoroType;
  timeRemaining: number;
  currentTaskId: string | null;
  currentSessionId: string | null;
  isFastMode: boolean;
}

type PomodoroAction =
  | { type: "START"; payload: { taskId?: string } }
  | { type: "PAUSE" }
  | { type: "TICK" }
  | { type: "COMPLETE" }
  | { type: "SKIP_BREAK" }
  | { type: "SET_SESSION_ID"; payload: string }
  | { type: "TOGGLE_FAST_MODE" };

const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

const initialState: PomodoroState = {
  isActive: false,
  type: "WORK",
  timeRemaining: WORK_DURATION,
  currentTaskId: null,
  currentSessionId: null,
  isFastMode: false,
};

function pomodoroReducer(
  state: PomodoroState,
  action: PomodoroAction,
): PomodoroState {
  switch (action.type) {
    case "START":
      return {
        ...state,
        isActive: true,
        currentTaskId: action.payload.taskId ?? null,
      };
    case "PAUSE":
      return {
        ...state,
        isActive: false,
      };
    case "TICK":
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
      };
    case "COMPLETE":
      return {
        ...state,
        isActive: false,
        type: state.type === "WORK" ? "BREAK" : "WORK",
        timeRemaining: state.type === "WORK" ? BREAK_DURATION : WORK_DURATION,
        currentSessionId: null,
      };
    case "SKIP_BREAK":
      return {
        ...state,
        type: "WORK",
        timeRemaining: WORK_DURATION,
        currentSessionId: null,
      };
    case "SET_SESSION_ID":
      return {
        ...state,
        currentSessionId: action.payload,
      };
    case "TOGGLE_FAST_MODE":
      return {
        ...state,
        isFastMode: !state.isFastMode,
      };
    default:
      return state;
  }
}

const PomodoroContext = createContext<{
  state: PomodoroState;
  startPomodoro: (taskId?: string) => void;
  pausePomodoro: () => void;
  completePomodoro: () => void;
  skipBreak: () => void;
  toggleFastMode: () => void;
  assignTaskToLastSession: (taskId: string) => void;
  lastCompletedSessionId: string | null;
} | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(pomodoroReducer, initialState);
  const utils = api.useUtils();
  const [lastCompletedSessionId, setLastCompletedSessionId] = useState<
    string | null
  >(null);

  const startSession = api.pomodoro.startSession.useMutation({
    onSuccess: (data) => {
      try {
        if (data && typeof data === "object" && "id" in data) {
          const id = String(data.id);
          dispatch({ type: "SET_SESSION_ID", payload: id });
        }
      } catch (e) {
        console.error("Failed to process session data:", e);
      }
    },
    onError: (error) => {
      console.error("Failed to start pomodoro session:", error.message);
      dispatch({ type: "PAUSE" });
    },
  });

  const completeSession = api.pomodoro.completeSession.useMutation({
    onSuccess: (data) => {
      try {
        if (data && typeof data === "object" && "id" in data) {
          const id = String(data.id);
          setLastCompletedSessionId(id);
        }
        void utils.task.invalidate();
        void utils.task.getYearActivity.invalidate();
      } catch (e) {
        console.error("Failed to process completed session:", e);
      }
    },
    onError: (error) => {
      console.error("Failed to complete pomodoro session:", error.message);
    },
  });

  const assignTask = api.pomodoro.assignTaskToSession.useMutation({
    onSuccess: () => {
      void utils.task.invalidate();
      void utils.task.getYearActivity.invalidate();
    },
    onError: (error) => {
      console.error(
        "Failed to assign task to pomodoro session:",
        error.message,
      );
    },
  });

  const assignTaskToLastSession = useCallback(
    (taskId: string) => {
      if (lastCompletedSessionId) {
        try {
          void assignTask.mutate({
            sessionId: lastCompletedSessionId,
            taskId,
          });
        } catch (error) {
          console.error("Failed to assign task to session:", error);
        }
      } else {
        console.error("No completed session to assign task to");
      }
    },
    [assignTask, lastCompletedSessionId],
  );

  const startPomodoro = useCallback(
    (taskId?: string) => {
      dispatch({ type: "START", payload: { taskId } });
      try {
        void startSession.mutate({
          taskId: state.type === "WORK" ? taskId : undefined,
          type: state.type,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error starting pomodoro:", error.message);
        } else {
          console.error("Error starting pomodoro:", error);
        }
        dispatch({ type: "PAUSE" });
      }
    },
    [state.type, startSession],
  );

  const pausePomodoro = useCallback(() => {
    dispatch({ type: "PAUSE" });
  }, []);

  const completePomodoro = useCallback(() => {
    if (state.currentSessionId) {
      try {
        void completeSession.mutate({ sessionId: state.currentSessionId });
      } catch (error) {
        console.error("Error completing pomodoro:", error);
      }
    }
    dispatch({ type: "COMPLETE" });
  }, [state.currentSessionId, completeSession]);

  const skipBreak = useCallback(() => {
    dispatch({ type: "SKIP_BREAK" });
  }, []);

  const toggleFastMode = useCallback(() => {
    dispatch({ type: "TOGGLE_FAST_MODE" });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isActive && state.timeRemaining > 0) {
      interval = setInterval(
        () => {
          dispatch({ type: "TICK" });
        },
        state.isFastMode ? 1 : 1000,
      );
    } else if (state.isActive && state.timeRemaining === 0) {
      completePomodoro();
    }
    return () => clearInterval(interval);
  }, [
    state.isActive,
    state.timeRemaining,
    state.isFastMode,
    completePomodoro,
    dispatch,
  ]);

  return (
    <PomodoroContext.Provider
      value={{
        state,
        startPomodoro,
        pausePomodoro,
        completePomodoro,
        skipBreak,
        toggleFastMode,
        assignTaskToLastSession,
        lastCompletedSessionId,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
}
