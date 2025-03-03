import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// TaskStatus enum for validation
const TaskStatus = z.enum(["SOON", "NOW", "HOLD"]);

// Task router with CRUD operations for tasks
export const taskRouter = createTRPCRouter({
  // Get all tasks for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        status: {
          not: "COMPLETED",
        },
      },
      orderBy: {
        position: "asc",
      },
    });
    return tasks;
  }),

  // Create a new task
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        status: TaskStatus,
        isImportant: z.boolean().optional().default(false),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the max position for the given status
      const maxPositionTask = await ctx.db.task.findFirst({
        where: {
          userId: ctx.session.user.id,
          status: input.status,
        },
        orderBy: {
          position: "desc",
        },
      });

      const position =
        input.position ?? (maxPositionTask ? maxPositionTask.position + 1 : 0);

      const task = await ctx.db.task.create({
        data: {
          content: input.content,
          status: input.status,
          isImportant: input.isImportant,
          position,
          userId: ctx.session.user.id,
        },
      });

      return task;
    }),

  // Update a task
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).optional(),
        status: z.enum(["SOON", "NOW", "HOLD", "COMPLETED"]).optional(),
        isImportant: z.boolean().optional(),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      type UpdateData = {
        content?: string;
        status?: "SOON" | "NOW" | "HOLD" | "COMPLETED";
        isImportant?: boolean;
        position?: number;
        completedAt?: Date | null;
      };

      const updateData: UpdateData = {};

      if (input.content !== undefined) {
        updateData.content = input.content;
      }

      if (input.status !== undefined) {
        updateData.status = input.status;

        // When marked as completed, set the completedAt timestamp
        if (input.status === "COMPLETED") {
          updateData.completedAt = new Date();

          // Create a completed day record for today
          const today = new Date();

          // Check if today already exists in completedDays
          const existingDay = await ctx.db.completedDay.findFirst({
            where: {
              userId: ctx.session.user.id,
              date: {
                equals: today,
              },
            },
          });

          // Create the completed day if it doesn't exist
          if (!existingDay) {
            await ctx.db.completedDay.create({
              data: {
                userId: ctx.session.user.id,
                date: today,
              },
            });
          }
        }
      }

      if (input.isImportant !== undefined) {
        updateData.isImportant = input.isImportant;
      }

      if (input.position !== undefined) {
        updateData.position = input.position;
      }

      const task = await ctx.db.task.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: updateData,
      });

      return task;
    }),

  // Delete a task
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.task.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      return { success: true };
    }),

  getCompletedTasks: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        status: "COMPLETED",
        completedAt: {
          not: null,
        },
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 100, // Limit to most recent 100 completed tasks
    });

    return tasks;
  }),

  getCompletedTasksByDates: protectedProcedure
    .input(
      z.object({
        dates: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Process each date separately
      try {
        const allTasksPromises = input.dates.map(async (dateStr) => {
          const date = new Date(dateStr);

          // Start of day
          const startDate = new Date(date);
          startDate.setHours(0, 0, 0, 0);

          // End of day
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);

          return ctx.db.task.findMany({
            where: {
              userId: ctx.session.user.id,
              status: "COMPLETED",
              completedAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          });
        });

        // Combine all results
        const tasksArrays = await Promise.all(allTasksPromises);
        const allTasks = tasksArrays.flat();

        // Sort by completedAt
        return allTasks.sort((a, b) => {
          return (
            new Date(b.completedAt ?? 0).getTime() -
            new Date(a.completedAt ?? 0).getTime()
          );
        });
      } catch (error) {
        console.error("Error in getCompletedTasksByDates:", error);
        return [];
      }
    }),

  // Get activity data for the last year based on completed tasks
  getYearActivity: protectedProcedure.query(async ({ ctx }) => {
    // Get the date from one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Find all completed tasks in the last year
    const completedTasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        status: "COMPLETED",
        completedAt: {
          gte: oneYearAgo,
        },
      },
      select: {
        completedAt: true,
      },
    });

    // Group tasks by day and count them
    const activityByDay = new Map<string, number>();

    for (const task of completedTasks) {
      // Make sure completedAt is not null before using it
      if (task.completedAt) {
        // Convert to YYYY-MM-DD format
        const dateStr = task.completedAt.toISOString().split("T")[0];

        // Ensure dateStr is a string (not undefined)
        if (dateStr) {
          // Safely update the count
          const currentCount = activityByDay.get(dateStr) ?? 0;
          activityByDay.set(dateStr, currentCount + 1);
        }
      }
    }

    // Convert to array format for the client
    const result = Array.from(activityByDay.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return result;
  }),

  // Get activity data for the last year based on completed tasks
});
