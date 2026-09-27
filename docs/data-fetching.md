# Data Fetching

## Server components only

**ALL data fetching in this app happens in server components. This is incredibly important — do not deviate.**

- No route handlers (`app/api/**/route.ts`) for fetching data.
- No client components fetching data (no `useEffect` + `fetch`, no SWR, no React Query, no client-side `fetch` calls at all).
- No other data-fetching mechanism of any kind.

Server components fetch data directly (via the helpers described below) and pass it down as props. Client components (`"use client"`) only receive data, render it, and handle interactivity — they never fetch it themselves.

Route handlers may still exist for things that truly aren't data fetching (e.g. webhooks), but never as a data source for the UI.

## Database access: Drizzle ORM via `/data` helpers only

- Every database query lives in a helper function inside the `/data` directory (e.g. `data/workouts.ts`).
- Server components call these helpers — they never import `db` or query the database directly.
- All queries use **Drizzle ORM** query builders. **No raw SQL** (no `sql\`...\`` templates, no raw driver queries).

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function getWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// app/dashboard/page.tsx (server component)
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkouts();
  return <WorkoutList workouts={workouts} />;
}
```

## User data isolation

**A logged-in user must only ever be able to access their own data — never any other user's. This is incredibly important.**

- Every `/data` helper that reads or writes user-owned rows (`workouts`, and anything joined off them: `workoutExercises`, `sets`) must scope the query to the current user via `auth()` from Clerk.
- Filter by `userId` directly on `workouts`, and for child tables (`workoutExercises`, `sets`) join back to `workouts` and filter on `workouts.userId` — never trust a client-supplied user ID or an unfiltered ID lookup (e.g. `getWorkout(id)` without also checking ownership).
- The `exercises` table is a shared catalog (no `userId`) and is not scoped.
- If there's no authenticated user, throw/return early — don't run the query.
