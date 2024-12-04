import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = request.nextUrl.pathname.startsWith("/profile");
  if (isAuth && !token) {
		return NextResponse.redirect(new URL("/", request.url));
	}
	return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:username*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
