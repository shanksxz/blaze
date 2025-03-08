"use client";

import LoadingSkeleton from "@/components/layout/loading-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { ChevronDown, Heart, MessageCircle, Repeat2 } from "lucide-react";
import Link from "next/link";

export default function PostList({ userId, context }: { userId: string; context: "posts" | "likes" }) {
	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = api.user.posts.useInfiniteQuery(
		{
			userId,
			limit: 3,
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
		<div className="space-y-4 mt-4">
			{data?.pages.map((page) =>
				page.items.map((post) => (
					<Card key={post.id} className="rounded-sm">
						<CardHeader>
							<div className="flex items-center gap-2">
								<Avatar className="w-10 h-10">
									<AvatarImage src={post.createdBy?.image ?? ""} alt={post.createdBy?.name ?? ""} />
									<AvatarFallback>{post.createdBy?.name?.slice(0, 2) ?? ""}</AvatarFallback>
								</Avatar>
								<div>
									<p className="font-semibold">{post.createdBy?.name}</p>
									<Link href={`/profile/${post.createdBy?.username}`} className="hover:underline">
										<p className="text-sm text-gray-500">@{post.createdBy?.username}</p>
									</Link>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p>{post.content}</p>
						</CardContent>
						<CardFooter className="text-gray-500 text-sm flex justify-between">
							<span>{post.createdAt.toLocaleString()}</span>
							<div className="flex gap-4">
								<span className="flex items-center gap-1">
									<MessageCircle size={16} /> {post.comments}
								</span>
								<span className="flex items-center gap-1">
									<Repeat2 size={16} /> {post.reposts}
								</span>
								<span className="flex items-center gap-1">
									<Heart size={16} /> {post.likes}
								</span>
							</div>
						</CardFooter>
					</Card>
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
