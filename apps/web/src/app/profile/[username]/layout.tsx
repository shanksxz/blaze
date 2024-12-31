import { Navbar } from "@/components/header/NavBar";

export default function RootLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main className="container mx-auto px-4">{children}</main>
		</div>
	);
}
