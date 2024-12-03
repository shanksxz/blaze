'use client';

import { Flame, Mail, User } from 'lucide-react';
import { memo } from 'react';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';

interface PostActionsProps {
	postId: number;
	likes: number;
	comments: number;
	reposts: number;
	hasLiked: boolean;
	hasReposted: boolean;
	onLike: (postId: number) => void;
	onRepost: (postId: number) => void;
	isLikeLoading?: boolean;
	isRepostLoading?: boolean;
}

export const PostActions = memo(function PostActions({
	postId,
	likes,
	comments,
	reposts,
	hasLiked,
	hasReposted,
	onLike,
	onRepost,
	isLikeLoading,
	isRepostLoading,
}: PostActionsProps) {
	return (
		<div className="mt-4 flex items-center space-x-4">
			<Button variant="ghost" size="sm" onClick={() => onLike(postId)} disabled={isLikeLoading}>
				<Flame className={cn('w-4 h-4 mr-1', hasLiked && 'text-red-500')} />
				{likes}
			</Button>
			<Button variant="ghost" size="sm">
				<Mail className="w-4 h-4 mr-1" />
				{comments}
			</Button>
			<Button variant="ghost" size="sm" onClick={() => onRepost(postId)} disabled={isRepostLoading}>
				<User className={cn('w-4 h-4 mr-1', hasReposted && 'text-green-500')} />
				{reposts}
			</Button>
		</div>
	);
});
