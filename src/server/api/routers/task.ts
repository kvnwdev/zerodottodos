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
      select: {
        id: true,
        content: true,
        status: true,
        isImportant: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        userId: true,
        completedDayId: true,
        totalPomodoros: true,
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
          // Store the completedAt timestamp in a way that preserves local timezone information
          updateData.completedAt = new Date();

          // Create a completed day record for today
          const today = new Date();
          // Format today's date in user's local timezone
          const todayFormatted = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );

          // Check if today already exists in completedDays
          const existingDay = await ctx.db.completedDay.findFirst({
            where: {
              userId: ctx.session.user.id,
              date: {
                equals: todayFormatted,
              },
            },
          });

          // Create the completed day if it doesn't exist
          if (!existingDay) {
            await ctx.db.completedDay.create({
              data: {
                userId: ctx.session.user.id,
                date: todayFormatted,
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
    .input(z.object({ dates: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Process each date
        const allTasksPromises = input.dates.map(async (dateStr) => {
          // Split the date string into parts
          const parts = dateStr.split("-");
          if (parts.length < 3) {
            throw new Error(`Invalid date format: ${dateStr}`);
          }

          // Ensure parts[1] and parts[2] are not undefined with fallbacks
          const month = parts[1] ?? "1";
          const dayOfMonth = parts[2] ?? "1";
          const monthIndex = parseInt(month, 10) - 1; // Convert to 0-indexed month
          const day = parseInt(dayOfMonth, 10);

          // Get all completed tasks regardless of year
          const tasks = await ctx.db.task.findMany({
            where: {
              userId: ctx.session.user.id,
              status: "COMPLETED",
              completedAt: {
                not: null,
              },
            },
            select: {
              id: true,
              content: true,
              status: true,
              isImportant: true,
              position: true,
              createdAt: true,
              updatedAt: true,
              completedAt: true,
              userId: true,
              completedDayId: true,
              totalPomodoros: true,
            },
          });

          // Filter tasks by month and day using local timezone methods
          return tasks.filter((task) => {
            if (!task.completedAt) return false;

            // Use local timezone methods
            const taskDate = new Date(task.completedAt);
            const taskMonth = taskDate.getMonth(); // 0-indexed
            const taskDay = taskDate.getDate();

            return taskMonth === monthIndex && taskDay === day;
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
        console.error(
          "Error in getCompletedTasksByDates:",
          error instanceof Error ? error.message : String(error),
        );
        return [];
      }
    }),

  // Get activity data for the last year based on completed tasks
  getYearActivity: protectedProcedure.query(async ({ ctx }) => {
    // Get the date from one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Find all completed tasks in the last year with their pomodoro sessions
    const completedTasks = await ctx.db.task.findMany({
      where: {
        userId: ctx.session.user.id,
        status: "COMPLETED",
        completedAt: {
          not: null,
        },
      },
      include: {
        pomodoroSessions: {
          where: {
            type: "WORK",
            completedAt: { not: null },
          },
          select: {
            id: true,
            type: true,
            completedAt: true,
          },
        },
      },
    });

    // Group tasks by day and count them, along with pomodoros
    const activityByDay = new Map<
      string,
      { tasks: number; pomodoros: number }
    >();

    for (const task of completedTasks) {
      if (task.completedAt) {
        // Format date in user's local timezone instead of UTC
        const taskDate = new Date(task.completedAt);
        const year = taskDate.getFullYear();
        const month = String(taskDate.getMonth() + 1).padStart(2, "0");
        const day = String(taskDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        if (!dateStr) continue; // Skip if we couldn't get a valid date string

        // Get or initialize the day's data
        const dayData = activityByDay.get(dateStr) ?? {
          tasks: 0,
          pomodoros: 0,
        };

        // Update counts
        dayData.tasks += 1;
        // Count completed WORK pomodoro sessions
        // Use a safe check for pomodoroSessions array
        let sessionCount = 0;
        // Use a safe type assertion to handle the property access
        if (
          task.pomodoroSessions &&
          typeof task.pomodoroSessions === "object" &&
          "length" in task.pomodoroSessions &&
          typeof task.pomodoroSessions.length === "number"
        ) {
          sessionCount = task.pomodoroSessions.length;
        }
        dayData.pomodoros = dayData.pomodoros + sessionCount;

        activityByDay.set(dateStr, dayData);
      }
    }

    // Convert to array format for the client
    const result = Array.from(activityByDay.entries()).map(([date, data]) => ({
      date,
      count: data.tasks,
      pomodoros: data.pomodoros,
    }));

    return result;
  }),

  // Complete a task
  complete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      // Create a completed day record for today
      const today = new Date();
      // Format today's date in user's local timezone
      const todayFormatted = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      // Check if today already exists in completedDays
      const existingDay = await ctx.db.completedDay.findFirst({
        where: {
          userId: ctx.session.user.id,
          date: {
            equals: todayFormatted,
          },
        },
      });

      // Create the completed day if it doesn't exist
      if (!existingDay) {
        await ctx.db.completedDay.create({
          data: {
            userId: ctx.session.user.id,
            date: todayFormatted,
          },
        });
      }

      return task;
    }),
});
