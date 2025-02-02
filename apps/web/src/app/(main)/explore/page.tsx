import { Search } from "@/features/explore/components/search-query";
import { TrendingTopics } from "@/features/explore/components/trending-topics";
import { redirect } from "next/navigation";

export default function Page({
	searchParams,
}: {
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	// If hashtag is provided in search params, redirect to explore with search
	if (searchParams.hashtag) {
		const hashtag = Array.isArray(searchParams.hashtag) ? searchParams.hashtag[0] : searchParams.hashtag;

		redirect(`/explore?q=%23${encodeURIComponent(hashtag.replace(/^#/, ""))}`);
	}

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
