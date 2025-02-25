import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that should redirect to dashboard when user is already logged in
const redirectToDashboardRoutes = [
  "/sign-in",
  "/sign-up",
  "/verified-email",
  "/waiting-verification",
  "/",
];

// Routes that require authentication to access
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check authentication status from session token
  const sessionToken = request.cookies.get("storeGo.session_token")?.value;
  const isAuthenticated = Boolean(sessionToken);

  // More precise matching for redirect routes - use exact matches
  const shouldRedirectToDashboard = redirectToDashboardRoutes.includes(path);

  // For protected routes, we still want to check if it starts with the path
  // to cover nested dashboard routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // Handle redirection to dashboard for authenticated users
  // BUT only if they're not already on a dashboard route
  if (
    shouldRedirectToDashboard &&
    isAuthenticated &&
    !path.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle protection for dashboard routes
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // Allow all other requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/sign-in",
    "/sign-up",
    "/verified-email",
    "/waiting-verification",
  ],
};
