import AppHeader from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<SidebarInset>
					<AppHeader />
					<main className="flex-1 container mx-auto px-6 py-4">{children}</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
