import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Flame } from "lucide-react";

export default async function Header() {
	//TODO: might add button for signout/signin
	//  const session = await auth.api.getSession({
	// 	headers: await headers(),
	// });
	return (
		<header className="p-4 flex justify-between item-center">
			<div className="flex items-center gap-2">
				<SidebarTrigger />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<div className="flex space-x-2 justify-center items-center">
					<h1 className="text-xl font-bold">Blaze</h1>
					<Flame className="w-6 h-6" color="orange" />
				</div>
			</div>
		</header>
	);
}
