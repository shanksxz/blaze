"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Please enter a valid email address"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z
			.string()
			.min(6, "Confirm password must be at least 6 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const [pending, setPending] = useState(false);

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
		setPending(true);
		try {
			await authClient.signUp.email({
				email: values.email,
				password: values.password,
				name: values.name,
			});
			toast.success("Account created successfully.");
		} catch (error) {
			const ctx = error as { error: { message?: string } };
			console.log("error", ctx);
			toast.error(ctx.error.message ?? "Something went wrong.");
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="grow flex items-center h-dvh justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-3xl font-bold text-center text-gray-800">
						Create Account
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{["name", "email", "password", "confirmPassword"].map((field) => (
								<FormField
									control={form.control}
									key={field}
									name={field as keyof z.infer<typeof signUpSchema>}
									render={({ field: fieldProps }) => (
										<FormItem>
											<FormLabel>
												{field.charAt(0).toUpperCase() + field.slice(1)}
											</FormLabel>
											<FormControl>
												<Input
													type={
														field.includes("password")
															? "password"
															: field === "email"
																? "email"
																: "text"
													}
													placeholder={`Enter your ${field}`}
													{...fieldProps}
													autoComplete="off"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							))}
							<Button type="submit" className="w-full" disabled={pending}>
								Sign up
							</Button>
						</form>
					</Form>
					<div className="mt-4 text-center text-sm">
						<Link href="/signin" className="text-primary hover:underline">
							Already have an account? Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
