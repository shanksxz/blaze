'use client';

import { Github } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export default function Login() {
	const handleGithubLogin = () => {
		signIn('github', { callbackUrl: '/' });
	};

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
				<CardDescription className="text-center">
					Sign in to your account using GitHub
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Button className="w-full" onClick={handleGithubLogin}>
					<Github className="mr-2 h-4 w-4" />
					Login with GitHub
				</Button>
			</CardContent>
		</Card>
	);
}
