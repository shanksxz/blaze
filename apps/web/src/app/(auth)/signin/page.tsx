"use client"

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/server/auth/auth-client';
import { useState } from 'react';
import { ErrorContext } from '@better-fetch/fetch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
			}
		);

	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md">
				<Card>
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
						<CardDescription className="text-center">
							Sign in to your account using GitHub
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full" onClick={handleGithubLogin} disabled={pendingGithub}>
							<Github className="mr-2 h-4 w-4" />
							Login with GitHub
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}