import { createTRPCRouter } from "~/server/api/trpc";
import { habitRouter } from "~/server/api/routers/habits";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  habit: habitRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
