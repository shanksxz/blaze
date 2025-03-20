//TODO: implementation of these hooks might be wrong or can be improved
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
			await utils.post.feed.cancel();
			await utils.post.getByPostId.cancel({ postId });
			await utils.bookmark.getBookmarkedPosts.cancel();
			await utils.search.explore.cancel();

			const prevData = {
				post: utils.post.getByPostId.getData({ postId }),
				posts: utils.post.feed.getData(),
				bookmarkPosts: utils.bookmark.getBookmarkedPosts.getData(),
				exploreResult: utils.search.explore.getInfiniteData({
					query: "",
					filters: [],
					sortBy: "relevance",
					limit: 5,
				}),
			};

			utils.post.getByPostId.setData({ postId }, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					updatePostAction(draft, "like");
				});
			});

			utils.post.feed.setInfiniteData({ limit: 5 }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => {
						return {
							...page,
							items: page.items.map((post) => {
								if (post.id === postId) {
									return produce(post, (draft) => {
										updatePostAction(draft, "like");
									});
								}
								return post;
							}),
						};
					}),
				};
			});

			utils.bookmark.getBookmarkedPosts.setInfiniteData(
				{
					limit: 5,
				},
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page) => {
							return {
								...page,
								items: page.items.map((p) => {
									if (p.id === postId) {
										return produce(p, (draft) => {
											updatePostAction(draft, "like");
										});
									}
									return p;
								}),
							};
						}),
					};
				},
			);

			utils.search.explore.setInfiniteData(
				{
					query: "",
					filters: [],
					sortBy: "relevance",
					limit: 5,
				},
				(oldData) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page: any) => {
							return {
								...page,
								items: page.items.map((post: PostType) => {
									if (post.id === postId) {
										return produce(post, (draft) => {
											updatePostAction(draft, "like");
										});
									}
									return post;
								}),
							};
						}),
					};
				},
			);

			return prevData;
		},
		onError: (_err, { postId }, context) => {
			if (context?.post) {
				utils.post.getByPostId.setData({ postId }, context.post);
			}
			if (context?.posts) {
				utils.post.feed.setData({}, context.posts);
			}
			if (context?.bookmarkPosts) {
				utils.bookmark.getBookmarkedPosts.setData({}, context.bookmarkPosts);
			}
			if (context?.exploreResult) {
				utils.search.explore.setInfiniteData(
					{
						query: "",
						filters: [],
						sortBy: "relevance",
						limit: 5,
					},
					context.exploreResult,
				);
			}
			toast.error("Failed to like post");
		},
		onSettled: async (_data, _error, variables) => {
			await utils.post.getByPostId.invalidate({ postId: variables.postId });
			await utils.post.feed.invalidate();
			await utils.search.explore.invalidate();
			await utils.bookmark.getBookmarkedPosts.invalidate();
		},
	});
}

export function useRepostPost() {
	const utils = api.useUtils();

	return api.post.toggleRepost.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.getByPostId.cancel({ postId });
			await utils.post.feed.cancel();
			await utils.bookmark.getBookmarkedPosts.cancel();
			await utils.search.explore.cancel();

			const prevData = {
				post: utils.post.getByPostId.getData({ postId }),
				posts: utils.post.feed.getData(),
				bookmarkPosts: utils.bookmark.getBookmarkedPosts.getData(),
				exploreResult: utils.search.explore.getInfiniteData({
					query: "",
					filters: [],
					sortBy: "relevance",
					limit: 5,
				}) as any,
			};

			utils.post.getByPostId.setData({ postId }, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					updatePostAction(draft, "repost");
				});
			});

			utils.post.feed.setInfiniteData({ limit: 5 }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => {
						return {
							...page,
							items: page.items.map((post) => {
								if (post.id === postId) {
									return produce(post, (draft) => {
										updatePostAction(draft, "repost");
									});
								}
								return post;
							}),
						};
					}),
				};
			});

			utils.bookmark.getBookmarkedPosts.setInfiniteData({ limit: 5 }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => {
						return {
							...page,
							items: page.items.map((p) => {
								if (p.id === postId) {
									return produce(p, (draft) => {
										updatePostAction(draft, "repost");
									});
								}
								return p;
							}),
						};
					}),
				};
			});

			utils.search.explore.setInfiniteData(
				{
					query: "",
					filters: [],
					sortBy: "relevance",
					limit: 5,
				},
				(oldData: any) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page: any) => {
							return {
								...page,
								items: page.items.map((post: PostType) => {
									if (post.id === postId) {
										return produce(post, (draft) => {
											updatePostAction(draft, "repost");
										});
									}
									return post;
								}),
							};
						}),
					};
				},
			);

			return prevData;
		},
		onError: (err, { postId }, context) => {
			if (context?.post) {
				utils.post.getByPostId.setData({ postId }, context.post);
			}
			if (context?.posts) {
				utils.post.feed.setData({}, context.posts);
			}
			if (context?.bookmarkPosts) {
				utils.bookmark.getBookmarkedPosts.setData({}, context.bookmarkPosts);
			}
			if (context?.exploreResult) {
				utils.search.explore.setInfiniteData(
					{
						query: "",
						filters: [],
						sortBy: "relevance",
						limit: 5,
					},
					context.exploreResult,
				);
			}
			toast.error("Failed to repost");
		},
		onSettled: async (_data, _error, variables) => {
			await utils.post.getByPostId.invalidate({ postId: variables.postId });
			await utils.post.getLatest.invalidate();
			await utils.bookmark.getBookmarkedPosts.invalidate();
			await utils.search.explore.invalidate();
		},
	});
}

export function useBookmarkPost() {
	const utils = api.useUtils();

	return api.bookmark.toggle.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.feed.cancel();
			await utils.post.getByPostId.cancel({ postId });
			await utils.bookmark.getBookmarkedPosts.cancel();
			await utils.search.explore.cancel();

			const prevData = {
				post: utils.post.getByPostId.getData({ postId }),
				posts: utils.post.feed.getData(),
				bookmarkedPosts: utils.bookmark.getBookmarkedPosts.getData(),
				exploreResult: utils.search.explore.getInfiniteData({
					query: "",
					filters: [],
					sortBy: "relevance",
					limit: 5,
				}) as any,
			};

			utils.post.feed.setInfiniteData({ limit: 5 }, (oldData) => {
				if (!oldData) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page) => {
						return {
							...page,
							items: page.items.map((post) => {
								if (post.id === postId) {
									return produce(post, (draft) => {
										draft.isBookmarked = !draft.isBookmarked;
									});
								}
								return post;
							}),
						};
					}),
				};
			});

			utils.post.getByPostId.setData({ postId }, (old) => {
				if (!old) return old;
				return produce(old, (draft) => {
					draft.isBookmarked = !draft.isBookmarked;
				});
			});

			utils.bookmark.getBookmarkedPosts.setInfiniteData({ limit: 5 }, (oldData) => {
				if (!oldData) return oldData;
				const post = oldData.pages.flatMap((page) => page.items).find((p) => p.id === postId);
				if (post) {
					return {
						...oldData,
						pages: oldData.pages.map((page) => {
							return {
								...page,
								items: page.items.filter((p) => p.id !== postId),
							};
						}),
					};
				}
				const newPost = utils.post.getByPostId.getData({ postId });
				if (!newPost) return oldData;
				return {
					...oldData,
					pages: oldData.pages.map((page, index) => {
						if (index === oldData.pages.length - 1) {
							return {
								...page,
								items: [...page.items, { ...newPost, isBookmarked: true }],
							};
						}
						return page;
					}),
				};
			});

			utils.search.explore.setInfiniteData(
				{
					query: "",
					filters: [],
					sortBy: "relevance",
					limit: 5,
				},
				(oldData: any) => {
					if (!oldData) return oldData;
					return {
						...oldData,
						pages: oldData.pages.map((page: any) => {
							return {
								...page,
								items: page.items.map((post: PostType) => {
									if (post.id === postId) {
										return produce(post, (draft) => {
											draft.isBookmarked = !draft.isBookmarked;
										});
									}
									return post;
								}),
							};
						}),
					};
				},
			);

			return prevData;
		},
		onError: (_err, { postId }, context) => {
			if (context?.post) {
				utils.post.getByPostId.setData({ postId }, context.post);
			}
			if (context?.posts) {
				utils.post.feed.setData({}, context.posts);
			}
			if (context?.bookmarkedPosts) {
				utils.bookmark.getBookmarkedPosts.setData({}, context.bookmarkedPosts);
			}
			if (context?.exploreResult) {
				utils.search.explore.setInfiniteData(
					{
						query: "",
						filters: [],
						sortBy: "relevance",
						limit: 5,
					},
					context.exploreResult,
				);
			}
			toast.error("Failed to bookmark post");
		},
		onSettled: async (_data, _error, variables) => {
			await utils.post.getByPostId.invalidate({ postId: variables.postId });
			await utils.post.getLatest.invalidate();
			await utils.bookmark.getBookmarkedPosts.invalidate();
			await utils.search.explore.invalidate();
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
