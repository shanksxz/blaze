import { AppSidebar } from "@/components/SideBar";
import Header from "@/components/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<div className="flex min-h-screen w-full">
				<AppSidebar />
				<SidebarInset className="flex flex-col">
					<Header />
					<main className="container mx-auto px-4">
					 {children}
					</main>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
