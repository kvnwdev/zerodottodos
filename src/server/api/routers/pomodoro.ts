import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const pomodoroRouter = createTRPCRouter({
  startSession: protectedProcedure
    .input(
      z.object({
        type: z.enum(["WORK", "BREAK"]),
        taskId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newSession = await ctx.db.pomodoroSession.create({
          data: {
            type: input.type,
            taskId: input.taskId,
            userId: ctx.session.user.id,
          },
        });

        return newSession;
      } catch (error) {
        console.error("Error starting pomodoro session:", error);
        throw new Error("Failed to start pomodoro session");
      }
    }),

  completeSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the session to complete
        const session = await ctx.db.pomodoroSession.findUnique({
          where: {
            id: input.sessionId,
            userId: ctx.session.user.id,
          },
        });

        if (!session) {
          throw new Error("Session not found");
        }

        // Complete the session
        const completedSession = await ctx.db.pomodoroSession.update({
          where: {
            id: input.sessionId,
          },
          data: {
            // Store completion time in local timezone
            completedAt: new Date(),
          },
        });

        // Increment the task's pomodoro count if this is a completed WORK session
        if (completedSession.type === "WORK" && completedSession.taskId) {
          await ctx.db.task.update({
            where: {
              id: completedSession.taskId,
              userId: ctx.session.user.id,
            },
            data: {
              totalPomodoros: {
                increment: 1,
              },
            },
          });
        }

        return completedSession;
      } catch (error) {
        console.error("Error completing pomodoro session:", error);
        throw new Error("Failed to complete pomodoro session");
      }
    }),

  assignTaskToSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        taskId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if the session exists
        const session = await ctx.db.pomodoroSession.findUnique({
          where: {
            id: input.sessionId,
            userId: ctx.session.user.id,
          },
        });

        if (!session) {
          throw new Error("Session not found");
        }

        // Update the session with the task ID
        const updatedSession = await ctx.db.pomodoroSession.update({
          where: {
            id: input.sessionId,
          },
          data: {
            taskId: input.taskId,
          },
        });

        // If the session is completed and of type WORK, increment the task's pomodoro count
        if (updatedSession.completedAt && updatedSession.type === "WORK") {
          // Increment the task's pomodoro count
          await ctx.db.task.update({
            where: {
              id: input.taskId,
              userId: ctx.session.user.id,
            },
            data: {
              totalPomodoros: {
                increment: 1,
              },
            },
          });
        }

        return updatedSession;
      } catch (error) {
        console.error("Error assigning task to pomodoro session:", error);
        throw new Error("Failed to assign task to pomodoro session");
      }
    }),
});
