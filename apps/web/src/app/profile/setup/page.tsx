"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { type SetupSchema, setupSchema } from "@/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Page() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SetupSchema>({
		resolver: zodResolver(setupSchema),
	});

	const router = useRouter();

	const { mutateAsync: setup } = api.user.setup.useMutation({
		onSuccess: (data) => {
			router.push(`/profile/${data?.username}`);
		},
	});
	const onSubmit = async (data: SetupSchema) => {
		await setup(data);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">Enter Username</CardTitle>
					<CardDescription>
						Please provide your desired username below.
					</CardDescription>
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
								{...register("username")}
							/>
							{errors.username && (
								<p className="text-red-500">
									{errors.username.message?.toString()}
								</p>
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
