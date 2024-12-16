import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { TRPCReactProvider } from '@/trpc/react';
import { Toaster } from '@/components/ui/sonner';
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});


export const metadata: Metadata = {
	title: 'Blaze',
	description:
		'Blaze is a social media platform designed to revolutionize real-time communication and connection.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geistSans.variable}`}>
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
				<Toaster />
			</body>
		</html>
	);
}