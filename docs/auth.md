# Auth

## Clerk only

This app uses **Clerk** (`@clerk/nextjs`) for all authentication. Never hand-roll auth (sessions, JWTs, password hashing, OAuth flows) — Clerk already provides it.

## Route protection: `proxy.ts`, not `middleware.ts`

This Next.js version renamed `middleware` to `proxy` (see `AGENTS.md`). Route protection lives in `src/proxy.ts` via `clerkMiddleware()`:

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
```

Don't create a `middleware.ts` file — it won't run in this Next.js version.

## Provider and header UI

`ClerkProvider` wraps the app once, in `src/app/layout.tsx`. Don't add another one per-route.

Signed-in/signed-out UI uses Clerk's `Show` component, not `<SignedIn>`/`<SignedOut>`:

```tsx
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton>...</SignInButton>
  <SignUpButton>...</SignUpButton>
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Sign-in / sign-up pages

Use Clerk's prebuilt `<SignIn />` / `<SignUp />` components on catch-all routes — don't build custom auth forms:

- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`

## Getting the current user in data helpers

See `/docs/data-fetching.md` for the full pattern. In short: every `/data` helper that touches user-owned rows calls `auth()` from `@clerk/nextjs/server`, throws/returns early if `userId` is missing, and filters the query by that `userId`. Never trust a client-supplied user ID.
