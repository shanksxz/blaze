import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Loading() {
	return (
		<div className="max-w-3xl mx-auto px-4 py-6">
			<header className="mb-8">
				<div className="flex items-center gap-4">
					<Skeleton className="w-24 h-24 rounded-full" />
					<div>
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<Skeleton className="mt-4 h-4 w-3/4" />
				<div className="flex items-center gap-4 mt-4">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-24" />
				</div>
				<div className="flex gap-4 mt-4">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
				</div>
			</header>
			<Tabs defaultValue="sparks">
				<TabsList className="w-full">
					<TabsTrigger value="sparks" className="flex-1">
						Sparks
					</TabsTrigger>
					<TabsTrigger value="replies" disabled className="flex-1">
						Replies
					</TabsTrigger>
					<TabsTrigger value="likes" className="flex-1">
						Likes
					</TabsTrigger>
				</TabsList>
				<TabsContent value="sparks">
					<SkeletonPostList />
				</TabsContent>
				<TabsContent value="replies">
					<p className="text-center py-8 text-gray-500">Replies will be displayed here</p>
				</TabsContent>
				<TabsContent value="likes">
					<SkeletonPostList />
				</TabsContent>
			</Tabs>
		</div>
	);
}

function SkeletonPostList() {
	return (
		<div className="space-y-4 mt-4">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="flex gap-4">
					<Skeleton className="w-12 h-12 rounded-full" />
					<div className="flex-1">
						<Skeleton className="h-4 w-1/4 mb-2" />
						<Skeleton className="h-4 w-full mb-2" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>
			))}
		</div>
	);
}
