import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';

export const userRouter = createTRPCRouter({
    test: publicProcedure.query(async () => {
        return {
            id: '1',
            name: 'Test User',
        }
    }),
});