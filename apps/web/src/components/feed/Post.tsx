"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useLikePost, useRepostPost } from "@/hooks/usePost";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import { Bookmark, BookmarkCheck, Flame, Mail, Repeat2, Share } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Post = RouterOutputs["post"]["getLatest"];

export function Post({
	post,
	userId,
}: {
	post: Post[number];
	userId?: string;
}) {
	const [isBookmarked, setIsBookmarked] = useState(false);

	const { hasLiked, isTogglingLike, toggleLike } = useLikePost({
		post,
		userId,
	});
	const { hasReposted, isTogglingRepost, toggleRepost } = useRepostPost({
		post,
		userId,
	});

	if (!post || !post.author || !post.author) return null;

	const handleShare = async () => {};

	const toggleBookmark = () => {
		setIsBookmarked(!isBookmarked);
	};

	return (
		<Card className="border-border rounded-sm hover:bg-accent/5 transition-colors">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<Avatar className="w-10 h-10">
						<AvatarImage src={post.author.image ?? ""} alt={post.author.name ?? ""} />
						<AvatarFallback>{post.author?.name?.slice(0, 2) ?? ""}</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-semibold">{post.author?.name}</p>
						<p className="text-sm text-muted-foreground">@{post.author?.username}</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<p className="whitespace-pre-wrap break-words">{post.content}</p>
			</CardContent>
			<CardFooter className="pt-0">
				<div className="flex items-center w-full -ml-2">
					<Button
						variant="ghost"
						size="sm"
						className="hover:bg-accent/10 group"
						onClick={(e) => {
							e.stopPropagation();
							toggleLike();
						}}
						disabled={isTogglingLike}
					>
						<Flame
							className={cn(
								"w-4 h-4 mr-1.5 transition-colors",
								hasLiked ? "text-red-500" : "group-hover:text-red-500",
							)}
						/>
						<span className={cn("group-hover:text-red-500", hasLiked && "text-red-500")}>
							{post.likes || 0}
						</span>
					</Button>
					<Button disabled variant="ghost" size="sm" className="hover:bg-accent/10 group">
						<Mail className="w-4 h-4 mr-1.5 group-hover:text-blue-500" />
						<span className="group-hover:text-blue-500">{post.commentsCount || 0}</span>
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="hover:bg-accent/10 group"
						onClick={(e) => {
							e.stopPropagation();
							toggleRepost();
						}}
						disabled={isTogglingRepost}
					>
						<Repeat2
							className={cn(
								"w-4 h-4 mr-1.5 transition-colors",
								hasReposted ? "text-green-500" : "group-hover:text-green-500",
							)}
						/>
						<span className={cn("group-hover:text-green-500", hasReposted && "text-green-500")}>
							{post.reposts || 0}
						</span>
					</Button>
					<div className="ml-auto flex">
						<Button
							disabled
							variant="ghost"
							size="sm"
							className="hover:bg-accent/10 group"
							onClick={(e) => {
								e.stopPropagation();
								handleShare();
							}}
						>
							<Share className="w-4 h-4 group-hover:text-blue-500" />
						</Button>
						<Button
							disabled
							variant="ghost"
							size="sm"
							className="hover:bg-accent/10 group"
							onClick={(e) => {
								e.stopPropagation();
								toggleBookmark();
							}}
						>
							{isBookmarked ? (
								<BookmarkCheck className="w-4 h-4 text-blue-500" />
							) : (
								<Bookmark className="w-4 h-4 group-hover:text-blue-500" />
							)}
						</Button>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
