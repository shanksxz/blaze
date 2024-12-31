//TODO: this code doesn't work as it should
//cant able to make this hook as dynamic for like and repost (irrespective of the function name)
//currently invalidating the cache for getLatest and getByPostId manually

import type { RouterOutputs } from "@/trpc/react";
import { api } from "@/trpc/react";

type PostType = RouterOutputs["post"]["getLatest"][number];

interface UsePostActionProps {
  post: PostType;
  userId?: string;
  queryKey?: "getLatest" | "getByPostId";
}

export function useLikePost({ post, userId, queryKey = "getLatest" }: UsePostActionProps) {
  const utils = api.useUtils();

  const { mutate: toggleLike, isPending: isTogglingLike } =
    api.post.toggleLike.useMutation({
      onMutate: async () => {
        await utils.post.getLatest.invalidate();
        const previousPosts = utils.post.getLatest.getData();

        utils.post.getLatest.setData(undefined, (old) => {
          if (!old) return old;
          return old.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
                hasLiked: !p.hasLiked,
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
      onSettled: async () => {
        //? invalidating the cache for getLatest and getByPostId manually
        await utils.post.getByPostId.invalidate({ postId : post.id });
        void utils.post.getLatest.invalidate();
      },
    });

  const handleToggleLike = () => {
    if (!userId) return;
    toggleLike({ postId: post.id });
  };

  return {
    hasLiked: post.hasLiked,
    isTogglingLike,
    toggleLike: handleToggleLike,
  };
}

export function useRepostPost({ post, userId, queryKey = "getLatest" }: UsePostActionProps) {
  const utils = api.useUtils();

  const { mutate: toggleRepost, isPending: isTogglingRepost } =
    api.post.toggleRepost.useMutation({
      onMutate: async ({ postId }) => {
        await utils.post.getLatest.cancel();
        const previousPosts = utils.post.getLatest.getData();

        utils.post.getLatest.setData(undefined, (old) => {
          if (!old) return old;
          return old.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                reposts: p.hasReposted ? p.reposts - 1 : p.reposts + 1,
                hasReposted: !p.hasReposted,
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
      onSettled: async() => {
        await utils.post.getByPostId.invalidate({ postId : post.id });
        void utils.post.getLatest.invalidate();
      },
    });

  const handleToggleRepost = () => {
    if (!userId) return;
    toggleRepost({ postId: post.id });
  };

  return {
    hasReposted: post.hasReposted,
    isTogglingRepost,
    toggleRepost: handleToggleRepost,
  };
}
