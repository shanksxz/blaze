import type { Session } from "@/server/auth/auth";
import { betterFetch } from "@better-fetch/fetch";
import { type NextRequest, NextResponse } from "next/server";

const authRoutes = ["/signin"];
const protectedRoutes = ["/profile", "/settings", "/dashboard"];

export async function middleware(request: NextRequest) {
	const pathName = request.nextUrl.pathname;
	const isAuthRoute = authRoutes.some((route) => pathName.startsWith(route));
	const isProtectedRoute = protectedRoutes.some((route) => pathName.startsWith(route));

	try {
		const { data: session } = await betterFetch<Session | null>("/api/auth/get-session", {
			baseURL: process.env.BETTER_AUTH_URL,
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		});

		if (!session) {
			if (isProtectedRoute) {
				return NextResponse.redirect(new URL("/auth/signin", request.url));
			}
			if (isAuthRoute && pathName === "/") {
				return NextResponse.next();
			}
			return NextResponse.next();
		}
		return NextResponse.next();
	} catch (error) {
		console.error("Error in auth middleware:", error);
		return NextResponse.redirect(new URL("/signin", request.url));
	}
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
