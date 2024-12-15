import SignOut from "@/components/SignOut";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function Home() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<div className="flex justify-center items-center min-h-dvh p-4">
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Welcome to Our App</CardTitle>
					<CardDescription>Explore our authentication system</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-left">
						{session ? (
							<div>
								<p className="font-medium">
									You are logged in as: {session.user.email}
								</p>
								<pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto text-sm">
									{JSON.stringify(session, null, 2)}
								</pre>
							</div>
						) : (
							<p>You are not logged in.</p>
						)}
					</div>
					<div
						className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded"
						role="alert"
					>
						<p className="font-bold">Try this:</p>
						<p>
							Attempt to access the dashboard without signing in. You'll be
							redirected to the sign-in page, demonstrating our protected route
							system.
						</p>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
					{session ? (
						<>
							<Button asChild>
								<Link href="/dashboard">Go to Dashboard</Link>
							</Button>
							<SignOut />
						</>
					) : (
						<>
							<Button asChild>
								<Link href="/signin">Sign In</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/dashboard">Try Accessing Dashboard</Link>
							</Button>
						</>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
