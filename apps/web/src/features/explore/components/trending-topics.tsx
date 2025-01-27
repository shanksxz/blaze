"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface Hashtag {
	name: string;
	count: number;
}

interface TrendingTopicsProps {
	limit?: number;
	compact?: boolean;
}

export function TrendingTopics({ limit = 5, compact = false }: TrendingTopicsProps) {
	const router = useRouter();
	const { data: trends } = api.hashtag.getTrending.useQuery(
		{ limit },
		{
			refetchInterval: 300000,
		},
	);

	const handleHashtagClick = (tag: string) => {
		//TODO: implement this
		// router.push(`/hashtag/${tag}`);
	};

	if (!trends) return null;

	return (
		<div className={compact ? "divide-y" : "divide-y px-4"}>
			{trends.map((trend) => (
				<TrendingTopic key={trend.name} trend={trend} onClick={handleHashtagClick} />
			))}
		</div>
	);
}

function TrendingTopic({ trend, onClick }: { trend: Hashtag; onClick: (tag: string) => void }) {
	return (
		<div className="py-3">
			<Link
				href={`/hashtag/${trend.name}`}
				className="w-full flex justify-between items-center p-2 rounded-md hover:bg-accent/50"
			>
				<div className="flex items-start gap-3">
					<div className="flex-1">
						<p className="font-bold">#{trend.name}</p>
						<p className="text-sm text-muted-foreground">{trend.count.toLocaleString()} posts</p>
					</div>
				</div>
				<MoreHorizontal className="h-5 w-5 text-muted-foreground" />
			</Link>
		</div>
	);
}
