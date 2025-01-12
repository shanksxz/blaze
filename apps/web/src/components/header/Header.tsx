"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";

export default function Header() {
	const pathname = usePathname();
	const pathSegments = pathname.split("/").filter((segment) => segment);

	return (
		<header className="p-4 flex flex-col gap-4">
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
								{pathSegments.slice(0, pathSegments.length - 1).map((segment, index) => (
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
			</div>
		</header>
	);
}
