import { NextResponse } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { allowRequest } from "@/lib/rate-limit";

const isPublicAdminRoute = createRouteMatcher([
  "/admin/login",
  "/admin/signup",
  "/admin/reset-password(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isTrackRoute = createRouteMatcher(["/track/(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Rate-limit public tracking page (5 page loads per minute per IP)
  if (isTrackRoute(request)) {
    const ip = (
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      "unknown"
    ).trim();
    if (!allowRequest(ip)) {
      return NextResponse.redirect(new URL("/?rateLimited=1", request.url));
    }
  }

  // Protect all admin routes except auth pages
  if (isAdminRoute(request) && !isPublicAdminRoute(request)) {
    if (!(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/admin/login");
    }
  }

  // Redirect authenticated admins away from login/signup
  if (isPublicAdminRoute(request)) {
    if (await convexAuth.isAuthenticated()) {
      return nextjsMiddlewareRedirect(request, "/admin/dashboard");
    }
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
