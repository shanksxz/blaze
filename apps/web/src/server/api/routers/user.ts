import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users, eq } from "@repo/database";

export const userRouter = createTRPCRouter({
  test: publicProcedure.query(async () => {
    return {
      id: "1",
      name: "Test User",
    };
  }),
  setup: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_]+$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUser = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (currentUser?.username) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Username can only be set once",
        });
      }

      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const user = await ctx.db
        .update(users)
        .set({ username: input.username.toLowerCase() })
        .where(eq(users.id, ctx.session.user.id))
        .returning();
      return user[0];
    }),
});
