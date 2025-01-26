import Feed from "@/features/feed/components/feed";
import Tweet from "@/features/feed/components/tweet";

export default async function Page() {
	return (
		<div className="min-h-screen bg-background">
			<Tweet />
			<Feed />
		</div>
	);
}
