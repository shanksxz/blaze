"use client";

import { Post } from "@/components/feed/Post";
import { authClient } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function Feed() {
	const router = useRouter();
	const { data: posts } = api.post.getLatest.useQuery();
	const { data: session } = authClient.useSession();

	console.log(posts);

	if (!posts) return null;

	return (
		<div className="space-y-4">
			{posts.map((post) => (
				<div
					key={post.id}
					onClick={() => router.push(`/post/${post.id}`)}
					className="cursor-pointer"
				>
					<Post post={post} userId={session?.user?.id} />
				</div>
			))}
		</div>
	);
}
