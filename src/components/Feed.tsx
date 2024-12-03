"use client"

import { usePost } from "~/hooks/usePost";
import { Post } from "~/components/Post";
import { api } from "~/trpc/react";

export default function Feed() {
    const { data: posts } = api.post.getAll.useQuery();
    const { toggleLike, toggleRepost } = usePost();

    return (
        <div className="space-y-4">
            {Array.isArray(posts) && posts.map((post) => (
                <Post
                    key={post.id}
                    post={post}
                    onLike={(postId) => toggleLike.mutate({ postId })}
                    onRepost={(postId) => toggleRepost.mutate({ postId })}
                    isLikeLoading={toggleLike.isPending}
                    isRepostLoading={toggleRepost.isPending}
                />
            ))}
        </div>
    );
}