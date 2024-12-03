'use client';

import { Flame, Mail, MoreHorizontal, User } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { RouterOutputs } from '~/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

type Post = RouterOutputs['post']['getAll'][number];

interface PostProps {
	post: Post;
	onLike: (postId: number) => void;
	onRepost: (postId: number) => void;
	isLikeLoading?: boolean;
	isRepostLoading?: boolean;
}

export function Post({
	post,
	onLike,
	onRepost,
	isLikeLoading,
	isRepostLoading,
}: PostProps) {
	console.log(`Post ${post.id} rendered`);
	return (
		<div className="border rounded-lg p-4">
			<div className="flex items-start space-x-3">
				<Avatar>
					<AvatarImage src={`${post.createdBy.image || ''}`} alt={`User ${post.createdBy.name}`} />
					<AvatarFallback>{post.createdBy.name}</AvatarFallback>
				</Avatar>
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<div>
							<span className="font-semibold">{post.createdBy.name}</span>
							<span className="text-muted-foreground ml-2">@{post.createdBy.name}</span>
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
							onClick={() => onLike(post.id)}
							disabled={isLikeLoading}
						>
							<Flame className={cn('w-4 h-4 mr-1', post.hasLiked && 'text-red-500')} />
							{post.likes}
						</Button>
						<Button variant="ghost" size="sm">
							<Mail className="w-4 h-4 mr-1" />
							{post.comments}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onRepost(post.id)}
							disabled={isRepostLoading}
						>
							<User className={cn('w-4 h-4 mr-1', post.hasReposted && 'text-green-500')} />
							{post.reposts}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
