import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from './env';
import { cookies } from 'next/headers';

const publicPaths = ['/', '/login'];
const isProduction = process.env.NODE_ENV === 'production';

export async function middleware(request: NextRequest) {

  let token = "";
  if(!isProduction) {
    token = await getToken({
      req: request,
      secret: env.AUTH_SECRET,
      raw: true,
    });
  } else {
    const cookie = (await cookies()).get('__Secure-authjs.session-token');
    token = cookie?.value || '';
  }

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
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};