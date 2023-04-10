import { z } from "zod";

import {
  createTRPCRouter, 
  protectedProcedure,
} from "~/server/api/trpc";

export const habitRouter = createTRPCRouter({
    getHabits: protectedProcedure
    .query(( {ctx} ) => {
        return ctx.session.user.id;
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
});
