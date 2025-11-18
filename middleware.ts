import { NextRequest, NextResponse } from "next/server";

/**
 * Route protection middleware
 * Reads HTTP-only auth_token cookie set by backend (XSS-safe)
 */
export default function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isTasksPage = request.nextUrl.pathname.startsWith("/tasks");

  // Redirect to login if accessing tasks without token
  if (isTasksPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect to tasks if accessing login with token
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/tasks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tasks/:path*", "/login"],
};
