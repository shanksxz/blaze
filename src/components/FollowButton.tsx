'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
}

export default function FollowButton({ userId, initialIsFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const utils = api.useUtils();
  
  const toggleFollow = api.user.toggleFollow.useMutation({
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      utils.user.profile.invalidate();
    },
  });

  return (
    <Button 
      onClick={() => toggleFollow.mutate({ userId })}
      variant={isFollowing ? "outline" : "default"}
      disabled={toggleFollow.isPending}
    >
      {toggleFollow.isPending 
        ? "Loading..." 
        : isFollowing 
          ? "Unfollow" 
          : "Follow"
      }
    </Button>
  );
} 