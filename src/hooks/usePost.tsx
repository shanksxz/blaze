'use client';
import { api } from '~/trpc/react';


export function usePost() {
	const utils = api.useUtils();
	const toggleLike = api.post.toggleLike.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.getAll.cancel();
			await utils.post.getById.cancel();

			const previousPosts = utils.post.getAll.getData();
			if (previousPosts) {
				const targetPost = previousPosts.find((p) => p.id === postId);

				utils.post.getAll.setData(undefined, (old) => {
					if (!old) return previousPosts;
					return old.map((p) => {
						if (p.id !== postId) return p;
						return {
							...p,
							hasLiked: !targetPost?.hasLiked,
							likes: targetPost?.hasLiked ? p.likes - 1 : p.likes + 1,
						};
					});
				});
			}

			const previousPost = utils.post.getById.getData({ id: postId });
			if (previousPost) {
				utils.post.getById.setData({ id: postId }, (old) => {
					if (!old) return previousPost;
					return {
						...old,
						hasLiked: !old.hasLiked,
						likes: old.hasLiked ? old.likes - 1 : old.likes + 1,
					};
				});
			}

			return { previousPosts, previousPost };
		},
		onError: (_, __, context) => {
			if (context?.previousPosts) {
				utils.post.getAll.setData(undefined, context.previousPosts);
			}
			if (context?.previousPost) {
				utils.post.getById.setData({ id: context.previousPost.id }, context.previousPost);
			}
		},
		onSettled: (_, __, { postId }) => {
			utils.post.getById.invalidate({ id: postId });
			utils.post.getAll.invalidate();
		},
	});

	const toggleRepost = api.post.toggleRepost.useMutation({
		onMutate: async ({ postId }) => {
			await utils.post.getAll.cancel();
			await utils.post.getById.cancel();

			const previousPosts = utils.post.getAll.getData();
			if (previousPosts) {
				const targetPost = previousPosts.find((p) => p.id === postId);
				if (targetPost) {
					utils.post.getAll.setData(undefined, (old) => {
						if (!old) return previousPosts;
						return old.map((p) => {
							if (p.id !== postId) return p;
							return {
								...p,
								hasReposted: !targetPost.hasReposted,
								reposts: targetPost.hasReposted ? p.reposts - 1 : p.reposts + 1,
							};
						});
					});
				}
			}

			const previousPost = utils.post.getById.getData({ id: postId });
			if (previousPost) {
				utils.post.getById.setData({ id: postId }, (old) => {
					if (!old) return previousPost;
					return {
						...old,
						hasReposted: !old.hasReposted,
						reposts: old.hasReposted ? old.reposts - 1 : old.reposts + 1,
					};
				});
			}

			return { previousPosts, previousPost };
		},
		onError: (_, __, context) => {
			if (context?.previousPosts) {
				utils.post.getAll.setData(undefined, context.previousPosts);
			}
			if (context?.previousPost) {
				utils.post.getById.setData({ id: context.previousPost.id }, context.previousPost);
			}
		},
		onSettled: (_, __, { postId }) => {
			utils.post.getById.invalidate({ id: postId });
			utils.post.getAll.invalidate();
		},
	});

	return {
		toggleLike,
		toggleRepost,
	};
}
