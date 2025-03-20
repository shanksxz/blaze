"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/trpc/react";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Search() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 300);

	const { data: results, isLoading } = api.search.all.useQuery(
		{ query: debouncedQuery },
		{
			enabled: debouncedQuery.length > 0,
		},
	);

	const handleSearch = (value: string) => {
		setQuery(value);
	};

	const handleClear = () => {
		setQuery("");
	};

	const handleHashtagClick = (tag: string) => {
		router.push(`/hashtag/${tag}`);
	};

	const handleUserClick = (username: string) => {
		router.push(`/profile/${username}`);
	};

	return (
		<div className="relative w-full">
			<div className="relative">
				<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					className="pl-9 pr-10"
					placeholder="Search hashtags or users"
					value={query}
					onChange={(e) => handleSearch(e.target.value)}
				/>
				{query && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute right-1 top-1/2 -translate-y-1/2"
						onClick={handleClear}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			{query && (
				<div className="absolute top-full w-full mt-2 bg-background border rounded-lg shadow-lg z-50 p-2">
					<ScrollArea className="max-h-[400px]">
						{isLoading ? (
							<div className="p-4 text-center text-muted-foreground">Loading...</div>
						) : results && (results.users.length > 0 || results.hashtags.length > 0) ? (
							<>
								{results.hashtags.map((hashtag) => (
									<Button
										key={hashtag.name}
										variant="ghost"
										className="w-full justify-start px-4 py-2"
										onClick={() => handleHashtagClick(hashtag.name)}
									>
										<div>
											<div className="font-medium">#{hashtag.name}</div>
											<div className="text-sm text-muted-foreground">
												{hashtag.count.toLocaleString()} posts
											</div>
										</div>
									</Button>
								))}

								{results.users.map((user) => (
									<Button
										key={user.id}
										variant="ghost"
										className="w-full justify-start px-4 py-2"
										onClick={() => handleUserClick(user.username as string)}
									>
										<Avatar className="h-8 w-8 mr-2">
											<AvatarImage src={user.image || ""} />
											<AvatarFallback>{user.name?.[0]}</AvatarFallback>
										</Avatar>
										<div className="text-left">
											<div className="font-medium">{user.name}</div>
											<div className="text-sm text-muted-foreground">@{user.username}</div>
										</div>
									</Button>
								))}
							</>
						) : (
							<div className="p-4 text-center text-muted-foreground">No results found</div>
						)}
					</ScrollArea>
				</div>
			)}
		</div>
	);
}
