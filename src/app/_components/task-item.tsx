"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, MoreHorizontal } from "lucide-react";

// Define TaskStatus enum locally until Prisma client is generated
enum TaskStatus {
  SOON = "SOON",
  NOW = "NOW",
  HOLD = "HOLD",
}

interface TaskItemProps {
  id: string;
  content: string;
  status: TaskStatus;
  isImportant: boolean;
  onUpdate: (
    id: string,
    data: { content?: string; status?: TaskStatus; isImportant?: boolean },
  ) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({
  id,
  content,
  status: _status,
  isImportant,
  onUpdate,
  onDelete: _onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (editValue.trim() !== "") {
      onUpdate(id, { content: editValue });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editValue.trim() !== "") {
        onUpdate(id, { content: editValue });
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setEditValue(content);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative mb-1 rounded-sm border p-2 text-sm ${isImportant ? "border-neutral-400" : "border-neutral-200"}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center">
        {isImportant && (
          <AlertCircle size={14} className="mr-1 text-neutral-500" />
        )}
        {isEditing ? (
          <input
            className="w-full bg-transparent outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="flex-1">{content}</span>
        )}
        <div
          {...attributes}
          {...listeners}
          className="ml-auto cursor-move opacity-0 transition group-hover:opacity-100"
        >
          <MoreHorizontal size={14} className="text-neutral-400" />
        </div>
      </div>
    </div>
  );
}
