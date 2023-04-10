import { z } from "zod";

import {
  createTRPCRouter, 
  protectedProcedure,
} from "~/server/api/trpc";

export const habitRouter = createTRPCRouter({
    getHabits: protectedProcedure
    .query(async ( {ctx} ) => {
        const habits = await ctx.prisma.habit.findMany({
            where: {
                userId: ctx.session.user.id
            }
        })
        return habits.map((habit) => {
            return {
                id: habit.id,
                name: habit.name,
                description: habit.description,
                createdAt: habit.createdAt,
                completedDates: habit.completedDates
            }
        });
    }),
    createHabit: protectedProcedure
    .input(z.object({
        name: z.string(),
        description: z.string(),
    }))
    .mutation(async ({ctx, input}) => {
        const habit = await ctx.prisma.habit.create({
            data: {
                name: input.name,
                description: input.description,
                userId: ctx.session.user.id,
            },
        })
        return habit;
    }),
    getHabitCount: protectedProcedure
    .query(async ( {ctx} ) => {
        return await ctx.prisma.habit.count({
            where: {
                userId: ctx.session.user.id
            }
        })
    }),
    deleteHabit: protectedProcedure
    .input(z.string())
    .mutation(async ({ctx, input}) => {
        return await ctx.prisma.habit.delete({
            where: {
                id: input,
            },
        })
    }),
    completeHabit: protectedProcedure
    .input(z.string())
    .mutation(async ({ctx, input}) => {
        const habitCompleted = await ctx.prisma.habit.update({
            data: {
                completedDates: {
                    push: new Date()
                }
            },
            where: {
                id: input,
            },
        })
    }),
});
