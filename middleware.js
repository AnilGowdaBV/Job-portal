import { NextResponse } from "next/server";

import { verifyAuthToken, getTokenCookieName } from "@/lib/auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/jobs"
]);

const ROLE_RULES = [
  { prefix: "/dashboard", roles: ["user", "company", "admin"] },
  { prefix: "/profile", roles: ["user", "company", "admin"] },
  { prefix: "/company", roles: ["company", "admin"] },
  { prefix: "/admin", roles: ["admin"] }
];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }
  if (pathname.startsWith("/api")) {
    return true;
  }
  if (pathname.startsWith("/_next")) {
    return true;
  }
  return false;
}

function resolveRequiredRoles(pathname) {
  for (const rule of ROLE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.roles;
    }
  }
  return null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getTokenCookieName())?.value;

  if (!token) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  let decoded;
  try {
    decoded = await verifyAuthToken(token);
  } catch (error) {
    console.error("Middleware token verification failed", error);
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const roles = resolveRequiredRoles(pathname);
  if (roles && (!decoded?.role || !roles.includes(decoded.role))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/company/:path*", "/admin/:path*", "/profile/:path*"]
};
