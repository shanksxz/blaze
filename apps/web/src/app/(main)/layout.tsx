import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="min-h-screen bg-background w-full">
				{/* <SidebarTrigger /> */}
				<main className="container mx-auto px-4 py-6">{children}</main>
			</div>
		</SidebarProvider>
	);
}
