import Feed from "@/components/feed/Feed";
import Tweet from "@/components/feed/Tweet";

export default async function Page() {
	return (
		<div className="min-h-screen bg-background">
				{/* <div className="max-w-3xl mx-auto px-2"> */}
					<Tweet />
					<Feed />
				{/* </div> */}
		</div>
	);
}
