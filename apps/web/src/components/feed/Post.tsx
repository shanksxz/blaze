"use client";

import { Flame, Mail, MoreHorizontal, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

type Post = RouterOutputs['post']['getLatest'];

export function Post({ post }: { post: Post[number] }) {
	if (!post || !post.createdById || !post.createdBy) return null;
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
							<Link
								href={`profile/${post.createdBy.username}`}
								className="text-muted-foreground ml-2"
							>
								@<span className="hover:underline">{post.createdBy.username}</span>
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
							disabled
						>
							<Flame className={cn('w-4 h-4 mr-1')} />
							{/* {post.likes} */}
						</Button>
						<Button variant="ghost" size="sm" disabled>
							<Mail className="w-4 h-4 mr-1" />
							{/* {post.comments} */}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							disabled
						>
							<User className={cn('w-4 h-4 mr-1')} />
							{/* {post.reposts} */}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}