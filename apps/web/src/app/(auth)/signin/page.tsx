"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/server/auth/auth-client";
import { ArrowLeft, Github } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function Signin() {
	const [pendingGithub, setPendingGithub] = useState(false);

	const handleGithubLogin = async () => {
		await authClient.signIn.social(
			{
				provider: "github",
			},
			{
				onRequest() {
					setPendingGithub(true);
				},
				onError(context) {
					setPendingGithub(false);
					toast.error(context.error.message);
				},
			},
		);
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md">
				<Card>
					<CardHeader className="space-y-1 relative">
						<Link href="/">
							<ArrowLeft className="w-5 h-5 text-gray-500 absolute top-4 left-4" />
						</Link>
						<CardTitle className="text-2xl font-bold text-center">
							Login
						</CardTitle>
						<CardDescription className="text-center">
							Sign in to your account using GitHub
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							className="w-full"
							onClick={handleGithubLogin}
							disabled={pendingGithub}
						>
							<Github className="mr-2 h-4 w-4" />
							Login with GitHub
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
