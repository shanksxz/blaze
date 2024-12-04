import '~/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import Providers from '~/providers/providers';
import { TRPCReactProvider } from '~/trpc/react';
import { Toaster } from '~/components/ui/sonner';

export const metadata: Metadata = {
	title: 'Blaze',
	description:
		'Blaze is a social media platform designed to revolutionize real-time communication and connection.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${GeistSans.variable}`}>
			<body>
				<Providers>
					<TRPCReactProvider>{children}</TRPCReactProvider>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
