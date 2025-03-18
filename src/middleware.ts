import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

// Routes that should redirect to dashboard when user is already logged in
const authRoutes = ["/sign-in", "/sign-up", "/waiting-verification", "/"];

// Routes that require authentication to access
const protectedRoutes = ["/dashboard", "/verified-email"];

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isInAuthRountes = authRoutes.includes(pathName);
  const isInProtectedRoutes = protectedRoutes.includes(pathName);
  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
    },
  });
  
  if (!session) {
    // if no session and user in auth routes , let him pass
    if (isInAuthRountes){
      return NextResponse.next();
    }
    // if no session and user in protected routes, redirect him to sign-in
    if (isInProtectedRoutes) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }
  // if user is logged in and in auth routes, redirect him to dashboard
  if (isInAuthRountes) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

// thie middleware will be applied to all routes except the ones that are excluded in the config
// excluding the api routes, static files, and images
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
