import LoadingSkeleton from "@/components/layout/loading-skeleton";
import { Suspense } from "react";
import Client from "./_client";

export default function Page() {
	return (
		<section>
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Bookmarks</h1>
				<p className="text-muted-foreground">Your saved posts</p>
			</div>
			<Suspense
				fallback={
					<div className="space-y-4">
						{[...Array(3)].map((_, index) => (
							<LoadingSkeleton key={index} />
						))}
					</div>
				}
			>
				<Client />
			</Suspense>
		</section>
	);
}
