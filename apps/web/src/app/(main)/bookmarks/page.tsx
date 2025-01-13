"use client";

import { Post } from "@/components/feed/Post";
import { useBookmarkPost, useLikePost, useRepostPost } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function Page() {
	const { data: bookmarkedPosts } = api.bookmark.getBookmarkedPosts.useQuery();
	const router = useRouter();
	const likeMutation = useLikePost();
	const repostMutation = useRepostPost();
	const bookmarkMutation = useBookmarkPost();

	if (!bookmarkedPosts) return null;
	return (
		<main className="max-w-2xl mx-auto pt-4 px-4">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Bookmarks</h1>
				<p className="text-muted-foreground">Your saved posts</p>
			</div>

			<div className="space-y-4">
				{bookmarkedPosts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No bookmarked posts yet</div>
				) : (
					bookmarkedPosts.map((post) => (
						<div key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
							<Post
								post={post}
								onLike={() => likeMutation.mutate({ postId: post.id })}
								onRepost={() => repostMutation.mutate({ postId: post.id })}
								onBookmark={() => bookmarkMutation.mutate({ postId: post.id })}
							/>
						</div>
					))
				)}
			</div>
		</main>
	);
}
