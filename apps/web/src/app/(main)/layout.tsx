import { AppSidebar } from "@/components/SideBar";
import Header from "@/components/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider defaultOpen>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<SidebarInset className="flex flex-col">
					<Header />
					<main className="flex-1 overflow-auto w-full">
						<div className="container mx-auto p-2">{children}</div>
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
