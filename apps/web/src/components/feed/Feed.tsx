"use client";

import { Post } from "@/components/feed/Post";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";

export default function Feed() {
	const { data: posts } = api.post.getLatest.useQuery();
	const { data: session } = authClient.useSession();

	if (!posts) return null;

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<Post key={post.id} post={post} userId={session?.user?.id} />
			))}
		</div>
	);
}
