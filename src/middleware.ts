import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/sign-in",
  "/sign-up",
  "/verified-email",
  "/waiting-verification",
];

// Define routes that require authentication
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Instead of auth.getSession (which isn’t defined), use your server-side logic.
  // For example, if your library provides a method to verify or parse the session
  // from the request cookies, use that:
  const sessionToken = request.cookies.get("storeGo.session_token")?.value;
  const isAuthenticated = Boolean(sessionToken); // or verify token validity

  // Check if the requested path is in protected routes
  const isProtectedRoute = protectedRoutes.some(
    (route) => path.startsWith(route) || path === route
  );

  // Check if the requested path is in public routes
  const isPublicRoute = publicRoutes.some(
    (route) => path.startsWith(route) || path === route
  );

  // If the route is protected and user is not authenticated,
  // redirect to sign-in page
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    // Store the original URL to redirect back after authentication
    signInUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(signInUrl);
  }

  // If the user is authenticated and trying to access public routes
  // (like sign-in), redirect them to dashboard
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    // Match all protected routes
    "/dashboard/:path*",
    // Match all auth routes
    "/sign-in",
    "/sign-up",
    "/verified-email",
    "/waiting-verification",
    // Add more routes as needed
  ],
};
