import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const completedDayRouter = createTRPCRouter({
  // Get all completed days for the last year
  getYearActivity: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const completedDays = await ctx.db.completedDay.findMany({
      where: {
        userId,
        date: {
          gte: oneYearAgo,
        },
      },
      select: {
        date: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return completedDays.map((day) => {
      // Format date in user's local timezone
      const date = new Date(day.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const dayOfMonth = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${dayOfMonth}`;

      return {
        date: formattedDate,
        count: day._count.tasks,
      };
    });
  }),

  // Toggle a day as completed
  toggleDay: protectedProcedure
    .input(
      z.object({
        date: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const date = new Date(input.date);

      // Check if the day already exists
      const existingDay = await ctx.db.completedDay.findFirst({
        where: {
          userId,
          date: {
            equals: date,
          },
        },
      });

      if (existingDay) {
        // Delete if exists
        await ctx.db.completedDay.delete({
          where: {
            id: existingDay.id,
          },
        });
        return { added: false };
      } else {
        // Create if doesn't exist
        await ctx.db.completedDay.create({
          data: {
            userId,
            date,
          },
        });
        return { added: true };
      }
    }),

  // Update note for a completed day
  updateNote: protectedProcedure
    .input(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dateObj = new Date(input.date);

      // Look for existing completed day
      const existingDay = await ctx.db.completedDay.findFirst({
        where: {
          userId: ctx.session.user.id,
          date: dateObj,
        },
      });

      if (!existingDay?.id) {
        throw new Error("Day not found");
      }

      return ctx.db.completedDay.update({
        where: { id: existingDay.id },
        data: { note: input.note },
      });
    }),

  seedActivityData: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Delete existing activity data for this user
    await ctx.db.completedDay.deleteMany({
      where: {
        userId,
      },
    });

    // Create sample data for the past year with varied patterns
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const daysToCreate = [];

    // Generate sample data with patterns
    // More activity on weekdays, less on weekends
    // Some streaks of consecutive days
    // Some gaps with no activity

    for (
      let date = new Date(oneYearAgo);
      date <= today;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Different probabilities for different patterns
      let probability;

      // Create streaks in certain months
      const month = date.getMonth();
      if (month === 1 || month === 5 || month === 9) {
        // Higher activity in Feb, Jun, Oct
        probability = isWeekend ? 0.6 : 0.9;
      } else if (month === 3 || month === 7 || month === 11) {
        // Lower activity in Apr, Aug, Dec
        probability = isWeekend ? 0.2 : 0.4;
      } else {
        // Normal activity in other months
        probability = isWeekend ? 0.3 : 0.7;
      }

      // Add some randomness
      if (Math.random() < probability) {
        const dateClone = new Date(date);

        // Generate random number of tasks (1-5)
        const taskCount = Math.floor(Math.random() * 5) + 1;

        daysToCreate.push({
          userId,
          date: dateClone,
          tasks: {
            create: Array.from({ length: taskCount }, (_, i) => {
              // Format date in local timezone for task content
              const year = dateClone.getFullYear();
              const month = String(dateClone.getMonth() + 1).padStart(2, "0");
              const day = String(dateClone.getDate()).padStart(2, "0");
              const formattedDate = `${year}-${month}-${day}`;

              return {
                userId,
                content: `Sample task ${i + 1} for ${formattedDate}`,
                isImportant: Math.random() > 0.7,
                status: "COMPLETED",
                position: i,
                completedAt: dateClone,
              };
            }),
          },
        });
      }
    }

    // Create the activity data in batches
    for (const dayData of daysToCreate) {
      await ctx.db.completedDay.create({
        data: dayData,
      });
    }

    return { success: true, count: daysToCreate.length };
  }),
});
