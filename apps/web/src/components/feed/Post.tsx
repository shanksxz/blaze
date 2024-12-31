"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLikePost, useRepostPost } from "@/hooks/usePost";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import { Flame, Mail, MoreHorizontal, Repeat2 } from "lucide-react";
import Link from "next/link";

type Post = RouterOutputs["post"]["getLatest"];

export function Post({
	post,
	userId,
}: { post: Post[number]; userId?: string }) {
	const {
		hasLiked,
		isTogglingLike,
		toggleLike,
	} = useLikePost({ post, userId });

	const {
	  hasReposted,
    isTogglingRepost,
    toggleRepost,
	} = useRepostPost({ post, userId });

	if (!post || !post.author || !post.author) return null;

	return (
		<div className="lg p-4 border">
			<div className="flex items-start space-x-3">
				<Avatar>
					<AvatarImage
						src={`${post.author.image || ""}`}
						alt={`User ${post.author.name}`}
					/>
					<AvatarFallback>{post.author.name}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<div>
							<span className="font-semibold">{post.author.name}</span>
							<Link
							  onClick={(e) => e.stopPropagation()}
								href={`/profile/${post.author.username}`}
								className="text-muted-foreground ml-2"
							>
								@<span className="hover:underline">{post.author.username}</span>
							</Link>
						</div>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="w-4 h-4" />
						</Button>
					</div>
					<p className="mt-2">{post.content}</p>
					<div className="mt-4 flex items-center space-x-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								toggleLike();
							}}
							disabled={isTogglingLike}
						>
							<Flame
								className={cn("w-4 h-4 mr-1", hasLiked && "text-red-500")}
							/>
							{post.likes}
						</Button>
						<Button variant="ghost" size="sm" disabled>
							<Mail className="w-4 h-4 mr-1" />
							{post.commentsCount}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								toggleRepost();
							}}
							disabled={isTogglingRepost}
						>
							<Repeat2
								className={cn("w-4 h-4 mr-1", hasReposted && "text-green-500")}
							/>
							{post.reposts}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
