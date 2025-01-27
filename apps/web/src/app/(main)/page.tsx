import LoadingSkeleton from "@/components/layout/loading-skeleton";
import Feed from "@/features/feed/components/feed";
import Tweet from "@/features/feed/components/tweet";
import { Suspense } from "react";

export default async function Page() {
	return (
		<div className="min-h-screen bg-background">
			<Tweet />
			<Suspense
				fallback={
					<div className="space-y-4">
						{[...Array(2)].map((_, index) => (
							<LoadingSkeleton key={index} />
						))}
					</div>
				}
			>
				<Feed />
			</Suspense>
		</div>
	);
}
