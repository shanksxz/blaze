import AppHeader from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<div className="flex-1 flex flex-col bg-background">
					<AppHeader />
					<main className="flex-1 container mx-auto px-4 py-8">{children}</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
