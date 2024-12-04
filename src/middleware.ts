import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from './env';

const publicPaths = ['/', '/login'];

export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: env.AUTH_SECRET,
		raw: true,
	});

	const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

	if (isPublicPath) {
		return NextResponse.next();
	}

	if (!token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
