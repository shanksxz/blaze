"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/server/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOut() {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	const handleSignOut = async () => {
		try {
			setPending(true);
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/signin");
						router.refresh();
					},
				},
			});
		} catch (error) {
			console.error("Error signing out:", error);
		} finally {
			setPending(false);
		}
	};

	return (
		<Button onClick={handleSignOut} variant="outline" disabled={pending}>
			Sign Out
		</Button>
	);
}
