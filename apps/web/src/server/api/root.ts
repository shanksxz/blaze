import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { bookmarkRouter } from "./routers/bookmark";
import { commentRouter } from "./routers/comments";
import { hashtagRouter } from "./routers/hashtags";
import { notificationRouter } from "./routers/notifications";
import { postRouter } from "./routers/post";
import { searchRouter } from "./routers/search";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	user: userRouter,
	post: postRouter,
	comment: commentRouter,
	bookmark: bookmarkRouter,
	hashtag: hashtagRouter,
	search: searchRouter,
	notifications: notificationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
