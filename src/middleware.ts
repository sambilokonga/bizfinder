import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { normalizeRole, getRoleRedirectPath } from "@/lib/auth/roles";

// Routes that require any authenticated user
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/city-admin(.*)",
  "/saved(.*)",
  "/claim(.*)",
  "/auth/redirect(.*)",
]);

// Routes that require admin or super_admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCityAdminRoute = createRouteMatcher(["/city-admin(.*)"]);

// Standalone listing wizard route - allowed for ALL authenticated users wanting to list a business
const isNewListingRoute = createRouteMatcher(["/dashboard/listings/new(.*)"]);

// Routes that require owner, admin, or super_admin role
const isOwnerRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (process.env.NODE_ENV === "development" && req.headers.get("x-bypass-auth") === "true") {
    return;
  }

  if (!isProtectedRoute(req)) return;

  // Ensure the user is authenticated
  const { userId, sessionClaims } = await auth.protect();

  /**
   * Extract the role from session claims and request cookies.
   */
  const claims = sessionClaims as any;
  const rawRole =
    claims?.metadata?.role ||
    claims?.public_metadata?.role ||
    claims?.publicMetadata?.role ||
    claims?.unsafe_metadata?.role ||
    claims?.unsafeMetadata?.role ||
    claims?.role ||
    claims?.roles ||
    claims?.org_role ||
    claims?.org_slug;

  const cookieRole = req.cookies.get("bizfinder_role")?.value;

  // If accessing the listing wizard, ANY authenticated user is allowed through!
  if (isNewListingRoute(req)) {
    return NextResponse.next();
  }

  // If both claim and cookie are missing, and user is accessing admin, city admin, or owner portal,
  // bounce through /auth/redirect to resolve live Clerk metadata & set cookie
  if (!rawRole && !cookieRole && (isAdminRoute(req) || isCityAdminRoute(req) || isOwnerRoute(req))) {
    const origin = req.nextUrl.pathname + req.nextUrl.search;
    return NextResponse.redirect(
      new URL(`/auth/redirect?origin=${encodeURIComponent(origin)}`, req.url)
    );
  }

  const role = normalizeRole(rawRole || cookieRole);

  // Admin-only routes: redirect non-admins to their portal
  const isAdminUser = role === "admin" || role === "super_admin" || role === "country_admin" || role === "city_admin";
  if (isAdminRoute(req) && !isAdminUser) {
    const destination = getRoleRedirectPath(role);
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // City Admin routes: city_admin, country_admin, super_admin, admin can access
  if (isCityAdminRoute(req) && !isAdminUser) {
    const destination = getRoleRedirectPath(role);
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // Owner+ routes: if general user visits /dashboard, direct them to list their business!
  if (isOwnerRoute(req) && role === "user") {
    return NextResponse.redirect(new URL("/dashboard/listings/new", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
