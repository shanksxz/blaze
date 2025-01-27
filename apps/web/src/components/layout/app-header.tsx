"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import React from "react";

export default function AppHeader() {
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const pathSegments = pathname
		.split("/")
		.filter(Boolean)
		.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
		.slice(0, pathname.split("/").filter(Boolean).length > 1 ? -1 : undefined);

	return (
		<header className="px-4 py-5 flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<SidebarTrigger />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<div className="flex space-x-2 justify-center items-center">
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem>
									<BreadcrumbLink href="/">Home</BreadcrumbLink>
								</BreadcrumbItem>
								{pathSegments.map((segment, index) => (
									<React.Fragment key={segment}>
										<BreadcrumbSeparator />
										<BreadcrumbItem>
											<BreadcrumbPage>{segment}</BreadcrumbPage>
										</BreadcrumbItem>
									</React.Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "light" ? "dark" : "light")}
					aria-label="Toggle theme"
				>
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</Button>
			</div>
		</header>
	);
}
