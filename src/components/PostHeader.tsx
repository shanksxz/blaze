'use client';

import { MoreHorizontal } from 'lucide-react';
import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

interface PostHeaderProps {
	name: string;
	image: string | null;
}

export const PostHeader = memo(function PostHeader({ name, image }: PostHeaderProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center space-x-3">
				<Avatar>
					<AvatarImage src={image || ''} alt={`User ${name}`} />
					<AvatarFallback>{name}</AvatarFallback>
				</Avatar>
				<div>
					<span className="font-semibold">{name}</span>
					<span className="text-muted-foreground ml-2">@{name}</span>
				</div>
			</div>
			<Button variant="ghost" size="icon">
				<MoreHorizontal className="w-4 h-4" />
			</Button>
		</div>
	);
});
