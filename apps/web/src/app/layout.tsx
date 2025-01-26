import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Provider } from "./providers/provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Blaze",
	description: "Blaze is a social media platform designed to revolutionize real-time communication and connection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geistSans.variable}`} suppressHydrationWarning>
			<body>
        <Provider>
          {children}
        </Provider>
				<Toaster />
			</body>
		</html>
	);
}
