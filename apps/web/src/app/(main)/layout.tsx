import { AppSidebar } from "@/components/SideBar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Flame } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider defaultOpen>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<SidebarInset className="flex flex-col">
					<header className="absolute top-5 left-5">
						<div className="flex items-center gap-2">
							<SidebarTrigger />
							<Separator orientation="vertical" className="mr-2 h-4" />
							<div className="flex space-x-2 justify-center items-center">
								<h1 className="text-xl font-bold">Blaze</h1>
								<Flame className="w-6 h-6" color="orange" />
							</div>
						</div>
					</header>
					<main className="flex-1 overflow-auto w-full mt-4">
						<div className="container mx-auto py-6 px-2 md:p-6">{children}</div>
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
