import { NextResponse } from "next/server";

const AUTH_COOKIE = "wedding-auth";

export function middleware(request) {
  const password = process.env.SITE_PASSWORD;

  // Skip protection when no password is configured.
  if (!password) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  // Allow the login route so users can enter the password.
  if (pathname === "/login") {
    const authCookie = request.cookies.get(AUTH_COOKIE)?.value;

    if (authCookie === "granted") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // Skip assets and Next.js internals.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Allow direct access to files in /public (e.g. SVGs)
  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE)?.value;

  if (authCookie === "granted") {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const redirectTarget = `${pathname}${search}`;

  if (redirectTarget && redirectTarget !== "/") {
    loginUrl.searchParams.set("from", redirectTarget);
  }

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico|images|robots.txt|sitemap.xml).*)"
};
