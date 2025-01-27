import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
	return (
		<div className="p-4 bg-card rounded-lg shadow-sm">
			<div className="flex items-start space-x-4">
				<Skeleton className="h-12 w-12 rounded-full" />
				<div className="flex-1 space-y-2">
					<Skeleton className="h-4 w-1/4" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-20 w-full" />
					<div className="flex justify-between pt-2">
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
						<Skeleton className="h-8 w-8" />
					</div>
				</div>
			</div>
		</div>
	);
}
