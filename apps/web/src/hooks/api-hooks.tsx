"use client";

import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/react";
import { produce } from "immer";
import { toast } from "sonner";

type PostType = RouterOutputs["post"]["getLatest"][number];

const updatePostAction = (post: PostType, actionType: "like" | "repost") => {
	const actionCount = actionType === "like" ? "likes" : "reposts";
	const hasAction = actionType === "like" ? "hasLiked" : "hasReposted";

	post[actionCount] += post[hasAction] ? -1 : 1;
	post[hasAction] = !post[hasAction];
};

export function useLikePost() {
	const utils = api.useUtils();

	return api.post.toggleLike.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.getByPostId.cancel({ postId });
			await utils.bookmark.getBookmarkedPosts.cancel();

			const prevData = {
				post: utils.post.getByPostId.getData({ postId }),
				posts: utils.post.getLatest.getData(),
				bookmarkPosts: utils.bookmark.getBookmarkedPosts.getData(),
			};

			utils.post.getByPostId.setData({ postId }, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					updatePostAction(draft, "like");
				});
			});

			utils.post.getLatest.setData(undefined, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					const post = draft.find((p) => p.id === postId);
					if (post) {
						updatePostAction(post, "like");
					}
				});
			});

			utils.bookmark.getBookmarkedPosts.setData(undefined, (old) => {
				if (!old) return old;
				const post = old.find((p) => p.id === postId);
				if (post) {
					return old.map((p) => {
						if (p.id === postId) {
							return produce(p, (draft) => {
								updatePostAction(draft, "like");
							});
						}
						return p;
					});
				}
				return old;
			});

			return prevData;
		},
		onError: (_err, { postId }, context) => {
			if (context?.post) {
				utils.post.getByPostId.setData({ postId }, context.post);
			}
			if (context?.posts) {
				utils.post.getLatest.setData(undefined, context.posts);
			}
			if (context?.bookmarkPosts) {
				utils.bookmark.getBookmarkedPosts.setData(undefined, context.bookmarkPosts);
			}
			toast.error("Failed to like post");
		},
		onSettled: async (_data, _error, variables) => {
			await utils.post.getByPostId.invalidate({ postId: variables.postId });
			await utils.post.getLatest.invalidate();
			await utils.bookmark.getBookmarkedPosts.invalidate();
		},
	});
}

export function useRepostPost() {
	const utils = api.useUtils();

	return api.post.toggleRepost.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.getByPostId.cancel({ postId });
			await utils.post.getLatest.cancel();
			await utils.bookmark.getBookmarkedPosts.cancel();

			const prevData = {
				post: utils.post.getByPostId.getData({ postId }),
				posts: utils.post.getLatest.getData(),
				bookmarkPosts: utils.bookmark.getBookmarkedPosts.getData(),
			};

			utils.post.getByPostId.setData({ postId }, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					updatePostAction(draft, "repost");
				});
			});

			utils.post.getLatest.setData(undefined, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					const post = draft.find((p) => p.id === postId);
					if (post) {
						updatePostAction(post, "repost");
					}
				});
			});

			utils.bookmark.getBookmarkedPosts.setData(undefined, (old) => {
				if (!old) return old;
				const post = old.find((p) => p.id === postId);
				if (post) {
					return old.map((p) => {
						if (p.id === postId) {
							return produce(p, (draft) => {
								updatePostAction(draft, "repost");
							});
						}
						return p;
					});
				}
				return old;
			});

			return prevData;
		},
		onError: (err, { postId }, context) => {
			if (context?.post) {
				utils.post.getByPostId.setData({ postId }, context.post);
			}
			if (context?.posts) {
				utils.post.getLatest.setData(undefined, context.posts);
			}
			if (context?.bookmarkPosts) {
				utils.bookmark.getBookmarkedPosts.setData(undefined, context.bookmarkPosts);
			}
			toast.error("Failed to repost");
		},
		onSettled: async (_data, _error, variables) => {
			await utils.post.getByPostId.invalidate({ postId: variables.postId });
			await utils.post.getLatest.invalidate();
			await utils.bookmark.getBookmarkedPosts.invalidate();
		},
	});
}

export function useBookmarkPost() {
	const utils = api.useUtils();

	return api.bookmark.toggle.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.getByPostId.cancel({ postId });

			const prevData = {
				post: utils.post.getByPostId.getData({ postId }),
				posts: utils.post.getLatest.getData(),
				bookmarkedPosts: utils.bookmark.getBookmarkedPosts.getData(),
			};

			utils.post.getLatest.setData(undefined, (old) => {
				if (!old) return old;
				return old.map((post) => {
					if (post.id === postId) {
						return produce(post, (draft) => {
							draft.isBookmarked = !draft.isBookmarked;
						});
					}
					return post;
				});
			});

			utils.post.getByPostId.setData({ postId }, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					draft.isBookmarked = !draft.isBookmarked;
				});
			});

			utils.bookmark.getBookmarkedPosts.setData(undefined, (old) => {
				if (!old) return old;
				const post = old.find((p) => p.id === postId);
				if (post) {
					return old.filter((p) => p.id !== postId);
				}
				const newPost = utils.post.getByPostId.getData({ postId });
				if (!newPost) return old;
				return [...old, { ...newPost, isBookmarked: true }];
			});

			return prevData;
		},
		onError: (_err, { postId }, context) => {
			if (context?.post) {
				utils.post.getByPostId.setData({ postId }, context.post);
			}
			if (context?.posts) {
				utils.post.getLatest.setData(undefined, context.posts);
			}
			toast.error("Failed to bookmark post");
		},
		onSettled: async (_data, _error, variables) => {
			await utils.post.getByPostId.invalidate({ postId: variables.postId });
			await utils.post.getLatest.invalidate();
			await utils.bookmark.getBookmarkedPosts.invalidate();
		},
	});
}

export function usePostService() {
	return {
		likePost: useLikePost(),
		repostPost: useRepostPost(),
		bookmarkPost: useBookmarkPost(),
	};
}