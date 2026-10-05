# Routing

## Everything lives under `/dashboard`

All app routes are nested under `/dashboard` (e.g. `/dashboard`, `/dashboard/workout/new`, `/dashboard/workout/[workoutId]`). Don't add top-level route segments for app features — only `/`, `/sign-in`, `/sign-up`, and `/dashboard/**` should exist under `src/app`.

## `/dashboard` is protected

Every route under `/dashboard` requires a signed-in user. Route protection is enforced in one place — `src/proxy.ts` — not per-page.

Use `createRouteMatcher` + `auth.protect()` in the Clerk middleware, scoped to `/dashboard`:

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
```

`auth.protect()` redirects signed-out users to sign-in before any `/dashboard` page or layout renders — don't also gate access with a check inside the page itself. See [auth.md](./auth.md) for why this file is named `proxy.ts` and not `middleware.ts`.

Data helpers still scope every query to `auth()`'s `userId` (see [data-fetching.md](./data-fetching.md)) — that's data isolation, not route protection, and both are required.
