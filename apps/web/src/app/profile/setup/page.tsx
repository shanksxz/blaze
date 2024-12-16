'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { authClient } from '@/server/auth/auth-client';

const schema = z.object({
	username: z.string().min(3, 'Username must be at least 3 characters long'),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
	});

	const router = useRouter();
	const { data: session } = authClient.useSession();


	useEffect(() => {
		if (session?.user?.username) {
			// router.push('/');
		}
	}, [session, router]);

	// const { mutateAsync: setup, isSuccess } = api.user.setup.useMutation({
	// 	onSuccess: (data) => {
	// 		router.push(`/profile/${data?.username}`);
	// 	},
	// });
	const onSubmit = async (data: FormData) => {
        console.log(data);
		// await setup(data);
		// if (isSuccess) {
		// 	console.log('success');
		// }
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Enter Username</CardTitle>
					<CardDescription>Please provide your desired username below.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<label
								htmlFor="username"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Username
							</label>
							<Input
								id="username"
								placeholder="Enter your username"
								type="text"
								autoCapitalize="none"
								autoComplete="username"
								autoCorrect="off"
								{...register('username')}
							/>
							{errors.username && (
								<p className="text-red-500">{errors.username.message?.toString()}</p>
							)}
						</div>
						<Button type="submit" className="w-full">
							Submit
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}