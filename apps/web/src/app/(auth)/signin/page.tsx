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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/server/auth-client";
import type { ErrorContext } from "@better-fetch/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signInSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
});

export default function SignIn() {
	const router = useRouter();

	const [pendingCredentials, setPendingCredentials] = useState(false);
	const [pendingGithub, setPendingGithub] = useState(false);
	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const handleCredentialsSignIn = async (
		values: z.infer<typeof signInSchema>,
	) => {
		setPendingCredentials(true);
		try {
			await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});
			router.push("/");
			router.refresh();
		} catch (error) {
			const ctx = error as ErrorContext;
			toast.error(ctx.error?.message ?? "Something went wrong.");
		} finally {
			setPendingCredentials(false);
		}
	};

	const handleSignInWithGithub = async () => {
		await authClient.signIn.social(
			{
				provider: "github",
			},
			{
				onRequest: () => {
					setPendingGithub(true);
				},
				onSuccess: async () => {
					// router.push("/");
					// router.refresh();
				},
				onError: (ctx: ErrorContext) => {
					toast.error(ctx.error?.message ?? "Something went wrong.");
				},
			},
		);
		setPendingGithub(false);
	};

	return (
		<div className="container mx-auto flex items-center justify-center min-h-screen py-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Sign in
					</CardTitle>
					<CardDescription className="text-center">
						Enter your email and password or use GitHub to sign in
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleCredentialsSignIn)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="m@example.com"
												{...field}
												type="email"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your password"
												{...field}
												type="password"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full"
								disabled={pendingCredentials}
							>
								{pendingCredentials ? "Signing in..." : "Sign in"}
							</Button>
						</form>
					</Form>
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>
					<Button
						variant="outline"
						type="button"
						className="w-full"
						onClick={handleSignInWithGithub}
						disabled={pendingGithub}
					>
						{pendingGithub ? (
							"Signing in..."
						) : (
							<>
								<Github className="mr-2 h-4 w-4" />
								GitHub
							</>
						)}
					</Button>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
					<div>
						Don't have an account?{" "}
						<Link href="/signup" className="hover:text-primary">
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
