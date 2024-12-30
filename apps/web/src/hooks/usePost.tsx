import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

interface UsePostProps {
	post: RouterOutputs["post"]["getLatest"][number];
	userId?: string;
}

export function usePost({ post, userId }: UsePostProps) {
	const utils = api.useUtils();

	const { mutate: toggleLike, isPending: isTogglingLike } =
		api.post.toggleLike.useMutation({
			onMutate: async () => {
				await utils.post.getLatest.cancel();
				const previousPosts = utils.post.getLatest.getData();
				utils.post.getLatest.setData(undefined, (old) => {
					if (!old) return old;
					return old.map((p) => {
						if (p.id === post.id) {
							const hasLiked = p.hasLiked;
							return {
								...p,
								likes: hasLiked ? p.likes - 1 : p.likes + 1,
								hasLiked: !hasLiked,
							};
						}
						return p;
					});
				});

				return { previousPosts };
			},
			onError: (_, __, context) => {
				utils.post.getLatest.setData(undefined, context?.previousPosts);
			},
			onSettled: () => {
				void utils.post.getLatest.invalidate();
			},
		});

	const { mutate: toggleRepost, isPending: isTogglingRepost } =
		api.post.toggleRepost.useMutation({
			onMutate: async () => {
				await utils.post.getLatest.cancel();
				const previousPosts = utils.post.getLatest.getData();

				utils.post.getLatest.setData(undefined, (old) => {
					if (!old) return old;
					return old.map((p) => {
						if (p.id === post.id) {
							const hasReposted = p.hasReposted;
							return {
								...p,
								reposts: hasReposted ? p.reposts - 1 : p.reposts + 1,
								hasReposted: !hasReposted,
							};
						}
						return p;
					});
				});

				return { previousPosts };
			},
			onError: (_, __, context) => {
				utils.post.getLatest.setData(undefined, context?.previousPosts);
			},
			onSettled: () => {
				void utils.post.getLatest.invalidate();
			},
		});

	const hasLiked = post.hasLiked;
	const hasReposted = post.hasReposted;

	const handleToggleLike = () => {
		if (!userId) return;
		toggleLike({ postId: post.id });
	};

	const handleToggleRepost = () => {
		if (!userId) return;
		toggleRepost({ postId: post.id });
	};

	return {
		hasLiked,
		hasReposted,
		isTogglingLike,
		isTogglingRepost,
		toggleLike: handleToggleLike,
		toggleRepost: handleToggleRepost,
	};
}
