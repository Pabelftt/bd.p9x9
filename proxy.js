import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Handle legacy /l (Videos) route by redirecting to home
  if (pathname === "/l") {
    return NextResponse.redirect(new URL("/", request.url), 301);
  }

  // Handle legacy POST /count by rewriting to /api/count
  if (pathname === "/count" && request.method === "POST") {
    return NextResponse.rewrite(new URL("/api/count", request.url));
  }

  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
