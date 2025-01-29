"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/auth/auth-client";
import type { RouterOutputs } from "@/trpc/react";
import { Bookmark, Flame, Mail, Repeat2, Share } from "lucide-react";
import Link from "next/link";

type Post = RouterOutputs["post"]["getLatest"][number];

type PostProps = {
	post: Post;
	onLike: (id: number) => void;
	onRepost: (id: number) => void;
	onBookmark: (id: number) => void;
};

export function Post({ post, onLike, onRepost, onBookmark }: PostProps) {
	if (!post || !post.author) return null;
	const { data: session } = authClient.useSession();
	return (
		<TooltipProvider>
			<Card className="border-border rounded-sm hover:bg-accent/5 transition-colors">
				<CardHeader className="pb-4">
					<div className="flex items-center gap-2">
						<Avatar className="w-10 h-10">
							<AvatarImage src={post.author.image ?? ""} alt={post.author.name ?? ""} />
							<AvatarFallback>{post.author?.name?.slice(0, 2) ?? ""}</AvatarFallback>
						</Avatar>
						<div>
							<p className="font-semibold">{post.author?.name}</p>
							<Link href={`/profile/${post.author.username}`} onClick={(e) => e.stopPropagation()}>
								<p className="text-sm text-muted-foreground hover:underline">
									@{post.author?.username}
								</p>
							</Link>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pb-4">
					<p className="whitespace-pre-wrap break-words ml-2">{post.content}</p>
				</CardContent>
				<CardFooter className="pt-0">
					<div className="flex items-center w-full flex-wrap -ml-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="hover:bg-accent/10 group"
									onClick={(e) => {
										e.stopPropagation();
										onLike(post.id);
									}}
									disabled={!session?.user}
								>
									<Flame
										className={cn(
											"w-4 h-4 mr-1.5 transition-colors",
											post.hasLiked ? "text-red-500" : "group-hover:text-red-500",
										)}
									/>
									<span className={cn("group-hover:text-red-500", post.hasLiked && "text-red-500")}>
										{post.likes || 0}
									</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Like</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button disabled variant="ghost" size="sm" className="hover:bg-accent/10 group">
									<Mail className="w-4 h-4 mr-1.5 group-hover:text-blue-500" />
									<span className="group-hover:text-blue-500">{post.commentsCount || 0}</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Comment</p>
							</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="hover:bg-accent/10 group"
									onClick={(e) => {
										e.stopPropagation();
										onRepost(post.id);
									}}
									disabled={!session?.user}
								>
									<Repeat2
										className={cn(
											"w-4 h-4 mr-1.5 transition-colors",
											post.hasReposted ? "text-green-500" : "group-hover:text-green-500",
										)}
									/>
									<span
										className={cn(
											"group-hover:text-green-500",
											post.hasReposted && "text-green-500",
										)}
									>
										{post.reposts || 0}
									</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Repost</p>
							</TooltipContent>
						</Tooltip>
						<div className="ml-auto flex">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										disabled
										variant="ghost"
										size="sm"
										className="hover:bg-accent/10 group"
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										<Share className="w-4 h-4 group-hover:text-blue-500" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Share</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="hover:bg-accent/10 group"
										onClick={(e) => {
											e.stopPropagation();
											onBookmark(post.id);
										}}
										disabled={!session?.user}
									>
										<Bookmark
											className={cn("h-4 w-4", post.isBookmarked ? "fill-current" : "fill-none")}
										/>
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Bookmark</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				</CardFooter>
			</Card>
		</TooltipProvider>
	);
}
