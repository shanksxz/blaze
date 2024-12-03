import '~/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import Providers from '~/providers/providers';
import { TRPCReactProvider } from '~/trpc/react';

export const metadata: Metadata = {
	title: 'Blaze',
	description:
		'Blaze is a social media platform designed to revolutionize real-time communication and connection.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${GeistSans.variable}`}>
			<head>
				<script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
			</head>
			<body>
				<Providers>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</Providers>
			</body>
		</html>
	);
}
