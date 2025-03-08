"use client";

import LoadingSkeleton from "@/components/layout/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Post } from "@/features/post/components/post-card";
import { usePostService } from "@/hooks/api-hooks";
import { api } from "@/trpc/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Feed() {
	const router = useRouter();
	const { likePost, repostPost, bookmarkPost } = usePostService();

	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = api.post.feed.useInfiniteQuery(
		{
			limit: 5,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, index) => (
					<LoadingSkeleton key={index} />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{data?.pages.map((page) =>
				page.items.map((post) => (
					<div key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="cursor-pointer">
						<Post
							post={post}
							onLike={() => likePost.mutate({ postId: post.id })}
							onRepost={() => repostPost.mutate({ postId: post.id })}
							onBookmark={() => bookmarkPost.mutate({ postId: post.id })}
						/>
					</div>
				)),
			)}

			{hasNextPage && (
				<div className="flex justify-center pt-4">
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchNextPage()}
						disabled={!hasNextPage || isFetchingNextPage}
						className="flex items-center gap-2"
					>
						{isFetchingNextPage ? (
							"Loading..."
						) : (
							<>
								<ChevronDown className="h-4 w-4" />
								Load more
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
