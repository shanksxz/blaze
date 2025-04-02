"use client";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function Provider({ children }: { children: React.ReactNode }) {
	return (
		<TRPCReactProvider>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				{children}
			</ThemeProvider>
		</TRPCReactProvider>
	);
}
