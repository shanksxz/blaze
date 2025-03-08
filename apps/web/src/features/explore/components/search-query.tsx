"use client";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Post } from "@/features/post/components/post-card";
import { usePostService } from "@/hooks/api-hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Calendar, CalendarIcon, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

export default function SearchInterface() {
	const [searchQuery, setSearchQuery] = useState("");
	const [date, setDate] = useState<DateRange | undefined>();
	const [sortBy, setSortBy] = useState<"relevance" | "newest" | "oldest">("relevance");
	const [openCalendar, setOpenCalendar] = useState(false);
	const [filters, setFilters] = useState<string[]>([]);
	const [cleanQuery, setCleanQuery] = useState("");
	const debouncedQuery = useDebounce(cleanQuery, 3000);
	const debouncedFilters = useDebounce(filters, 3000);
	const router = useRouter();

	const { likePost, repostPost, bookmarkPost } = usePostService();

	const {
		data: searchResults,
		isLoading,
		fetchNextPage,
		hasNextPage,
	} = api.search.explore.useInfiniteQuery(
		{
			query: debouncedQuery,
			dateRange: date,
			filters: debouncedFilters,
			sortBy,
			limit: 5,
		},
		{
			enabled: Boolean(debouncedQuery.length > 0 || debouncedFilters.length > 0),
			retry: false,
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		const usernames = query.match(/from:[a-zA-Z0-9_]+/g)?.map((u) => u) || [];
		const hashtags = query.match(/#[a-zA-Z0-9]+/g)?.map((f) => f) || [];
		setFilters([...usernames, ...hashtags]);
		const cleanedQuery = query
			.replace(/from:[a-zA-Z0-9]+/g, "")
			.replace(/#[a-zA-Z0-9]+/g, "")
			.trim();
		setCleanQuery(cleanedQuery);
	};

	const formatDateRange = () => {
		if (date?.from && date?.to) {
			return `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`;
		}
		return "Select date range";
	};

	return (
		<div className="w-full space-y-4">
			<div className="space-y-4">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search posts, users, and topics (try from:user or #hashtag)"
						value={searchQuery}
						onChange={(e) => handleInputChange(e)}
						className="pl-9"
					/>
				</div>
			</div>
			<div className="flex flex-wrap gap-4">
				<Popover open={openCalendar} onOpenChange={setOpenCalendar}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{formatDateRange()}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<CalendarComponent
							initialFocus
							mode="range"
							defaultMonth={date?.from}
							selected={date}
							onSelect={(value: DateRange | undefined) => setDate(value)}
							numberOfMonths={2}
						/>
					</PopoverContent>
				</Popover>

				<Select value={sortBy} onValueChange={(value: "relevance" | "newest" | "oldest") => setSortBy(value)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="relevance">Sort by Relevance</SelectItem>
						<SelectItem value="newest">Date (Newest First)</SelectItem>
						<SelectItem value="oldest">Date (Oldest First)</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{isLoading ? (
				<div className="text-center py-8">Loading...</div>
			) : searchResults?.pages?.length ? (
				<div className="space-y-4">
					{searchResults.pages.map((page) =>
						page.items.map((post) => (
							<div
								key={post.id}
								onClick={() => router.push(`/post/${post.id}`)}
								className="cursor-pointer"
							>
								<Post
									post={post}
									onLike={() => likePost.mutate({ postId: post.id })}
									onRepost={() => repostPost.mutate({ postId: post.id })}
									onBookmark={() => bookmarkPost.mutate({ postId: post.id })}
								/>
							</div>
						)),
					)}
					{hasNextPage && (
						<div className="text-center">
							<Button onClick={() => fetchNextPage()}>Load More</Button>
						</div>
					)}
				</div>
			) : searchQuery ? (
				<div className="text-center py-8 text-muted-foreground">No results found</div>
			) : null}

			<div className="text-sm text-muted-foreground mt-4">
				<p>Pro tips:</p>
				<ul className="list-disc list-inside space-y-1 mt-2">
					<li>Use from:username to find posts from specific users</li>
					<li>Use #hashtag to search for topics</li>
					<li>Combine filters like: from:user #hashtag</li>
				</ul>
			</div>
		</div>
	);
}
