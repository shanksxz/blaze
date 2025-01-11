"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/server/auth/auth-client";
import { Bell, BookMarked, Home, LogOut, Mail, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

const items = [
	{ title: "Home", url: "/", icon: Home, disabled: false },
	{ title: "Explore", url: "/explore", icon: Search, disabled: true },
	{ title: "Notifications", url: "/notifications", icon: Bell, disabled: true },
	{ title: "Messages", url: "/messages", icon: Mail, disabled: true },
	{ title: "Bookmarks", url: "/bookmarks", icon: BookMarked, disabled: true },
	{ title: "Profile", url: "/profile", icon: User, disabled: false },
];

export function AppSidebar() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();
	const [pending, setPending] = useState(false);
	const router = useRouter();
	const { state, isMobile } = useSidebar();

	const handleSignOut = async () => {
		try {
			setPending(true);
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/signin");
						router.refresh();
					},
				},
			});
		} catch (error) {
			console.error("Error signing out:", error);
		} finally {
			setPending(false);
		}
	};

	return (
		<Sidebar collapsible="icon" variant="inset" className="px-4 py-6">
			<SidebarContent className="flex flex-col space-y-2 h-full px-4 py-10 md:p-0">
				<SidebarMenu className="space-y-3">
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
								<Link
									href={item.url === "/profile" ? `/profile/${session?.user.username}` : item.url}
									aria-disabled={item.disabled}
								>
									<item.icon className="size-5" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			{state === "expanded" && session && (
				<SidebarFooter className="p-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent"
							>
								<Avatar className="size-8">
									<AvatarImage src={session?.user.image ?? ""} alt="@username" />
									<AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
								</Avatar>
								<div className="flex flex-1 flex-col items-start text-left">
									<span className="text-sm font-medium leading-none">{session?.user.name}</span>
									<span className="text-xs text-muted-foreground">@{session?.user.username}</span>
								</div>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuItem onClick={handleSignOut} disabled={pending}>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarFooter>
			)}
			{isMobile && !session && (
				<Button variant="default" size="sm" onClick={() => router.push("/signin")}>
					Sign in
				</Button>
			)}
			<SidebarRail />
		</Sidebar>
	);
}
