import { CommentBox } from "@/components/comments/CommentBox";
import { Post } from "@/components/feed/Post";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type tProps = Promise<{
	postId: string;
}>;

export default async function Page(props: {
	params: tProps;
}) {
	const { postId } = await props.params;
	const post = await api.post.getByPostId({ postId: postId });
	console.log(post);

	return (
		<div className="min-h-screen bg-background max-w-2xl mx-auto">
			<div className="flex items-center justify-start h-14">
				<Link href="/">
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<h1 className="text-xl font-semibold ml-2">Post</h1>
			</div>
			<Card className="rounded-sm">
				<Post post={post} userId="1" />
				<CommentBox postId={postId} />
			</Card>
		</div>
	);
}
