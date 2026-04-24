import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are public (no authentication required)
// Adjusted for your app's structure
const isPublicRoute = createRouteMatcher([
  "/",
  "/api/auth(.*)", // NextAuth routes
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/public(.*)",
]);

export default clerkMiddleware((auth, request) => {
  // If it's not a public route, protect it
  if (!isPublicRoute(request)) {
    // We don't call auth().protect() here yet because we have 
    // a hybrid auth setup (NextAuth vs Clerk).
    // The middleware just needs to be PRESENT for auth() to work in the routes.
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
