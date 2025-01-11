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
} from "@/components/ui/sidebar";
import { authClient } from "@/server/auth/auth-client";
import {
	Bell,
	BookMarked,
	Home,
	LogOut,
	Mail,
	Search,
	User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

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
		<Sidebar className="border-r border-border p-4 mt-5">
			<SidebarContent className="flex flex-col justify-between h-full">
				<SidebarMenu className="space-y-3">
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton asChild isActive={pathname === item.url}>
								<Link
									href={
										item.url === "/profile"
											? `/profile/${session?.user.username}`
											: item.url
									}
									aria-disabled={item.disabled}
									className="flex items-center p-2 rounded-full hover:bg-accent"
								>
									<item.icon className="w-6 h-6 mr-4" />
									<span className="hidden md:inline">{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter className="mt-auto">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<div className="w-full flex justify-start py-1 px-4">
							<Avatar className="w-10 h-10 mr-2">
								<AvatarImage src={session?.user.image ?? ""} alt="@username" />
								<AvatarFallback>{session?.user.name?.[0]}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col items-start text-left">
								<span className="font-semibold">{session?.user.name}</span>
								<span className="text-sm text-muted-foreground">
									@{session?.user.username}
								</span>
							</div>
						</div>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuItem onClick={handleSignOut} disabled={pending}>
							<LogOut className="mr-2 h-4 w-4" />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
