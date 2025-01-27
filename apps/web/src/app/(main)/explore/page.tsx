import { Search } from "@/features/explore/components/search-query";
import { TrendingTopics } from "@/features/explore/components/trending-topics";

export default function Page() {
	return (
		<div className="flex min-h-screen justify-center">
			<section className="flex-1">
				<div className="sticky top-0 z-10 bg-background/95 backdrop-blur">
					<div className="flex items-center px-4 py-3">
						<Search />
					</div>
				</div>
				<div className="divide-y">
					<TrendingTopics />
				</div>
			</section>
		</div>
	);
}
