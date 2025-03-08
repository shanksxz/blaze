import { Search } from "@/features/trending/components/search-query";
import { TrendingTopics } from "@/features/trending/components/trending-topics";

export default async function Page() {
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
