import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { api } from "@/trpc/server";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

export default async function PostList({
	userId,
	context,
}: { userId: string; context: "posts" | "likes" }) {
	const posts = await api.user[context]({ userId });
	return (
		<div className="space-y-4 mt-4">
			{posts.map((post) => (
				<Card key={post.id}>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Avatar className="w-10 h-10">
								<AvatarImage
									src={post.createdBy?.image ?? ""}
									alt={post.createdBy?.name ?? ""}
								/>
								<AvatarFallback>
									{post.createdBy?.name?.slice(0, 2) ?? ""}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-semibold">{post.createdBy?.name}</p>
								<p className="text-sm text-gray-500">
									@{post.createdBy?.username}
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p>{post.content}</p>
					</CardContent>
					<CardFooter className="text-gray-500 text-sm flex justify-between">
						<span>{post.createdAt.toLocaleString()}</span>
						<div className="flex gap-4">
							<span className="flex items-center gap-1">
								<MessageCircle size={16} /> {post.comments}
							</span>
							<span className="flex items-center gap-1">
								<Repeat2 size={16} /> {post.reposts}
							</span>
							<span className="flex items-center gap-1">
								<Heart size={16} /> {post.likes}
							</span>
						</div>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
