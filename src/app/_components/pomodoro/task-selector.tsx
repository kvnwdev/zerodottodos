"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface TaskSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (taskId: string) => void;
}

export function TaskSelector({ isOpen, onClose, onSelect }: TaskSelectorProps) {
  const { data: tasks } = api.task.getAll.useQuery();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedTaskId) {
      onSelect(selectedTaskId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>assign pomodoro to task</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {tasks?.map((task) => (
            <button
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`w-full rounded-md px-4 py-2 text-left text-sm transition-colors ${
                selectedTaskId === task.id
                  ? "bg-neutral-100 dark:bg-neutral-800"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{task.content}</span>
                {task.totalPomodoros > 0 && (
                  <span className="text-xs text-neutral-500">
                    {task.totalPomodoros} ⏰
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            skip
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedTaskId}
          >
            assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
