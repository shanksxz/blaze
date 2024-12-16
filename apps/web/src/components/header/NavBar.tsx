import NavDropDown from "@/components/header/NavDropDown";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth/auth";
import { Bell, Flame, Home, Mail } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export async function Navbar() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return (
		<header className="sticky top-0 z-50 bg-background border-b">
			<div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link href="/">
					<Flame className="w-8 h-8" color="#ff7800" />
				</Link>
				<nav className="hidden md:flex space-x-4">
					<Link href="/">
						<Button variant="ghost">
							<Home className="w-5 h-5 mr-2" />
							Home
						</Button>
					</Link>
					<Button variant="ghost" disabled>
						<Bell className="w-5 h-5 mr-2" />
						Notifications
					</Button>
					<Button variant="ghost" disabled>
						<Mail className="w-5 h-5 mr-2" />
						Messages
					</Button>
				</nav>
				<NavDropDown user={session?.user} />
			</div>
		</header>
	);
}
