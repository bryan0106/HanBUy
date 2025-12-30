import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Check for auth token in cookies (for server-side)
    const authToken = request.cookies.get("hanbuy_auth");
    
    // If no auth token, redirect to login
    if (!authToken) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};

