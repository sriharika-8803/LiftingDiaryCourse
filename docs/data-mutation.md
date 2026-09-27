# Data Mutations

## Mutations: server actions in colocated `actions.ts` only

**ALL data mutations happen via server actions. This is incredibly important — do not deviate.**

- No route handlers (`app/api/**/route.ts`) for mutating data.
- No client-side mutation of any kind (no client `fetch`/`axios` POST/PATCH/DELETE calls).
- Every server action lives in a file named `actions.ts`, colocated next to the feature that uses it (e.g. `app/dashboard/actions.ts`).
- Each file starts with `"use server"`.

```ts
// app/dashboard/actions.ts
"use server";

import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(startedAt: Date) {
  return createWorkout(startedAt);
}
```

## Params: typed arguments, never `FormData`

- Server action parameters are typed (`string`, `Date`, `number`, a plain object, etc.).
- Server actions must **never** take a `FormData` parameter. Call the action directly with typed arguments (e.g. from a form's `onSubmit` handler, after reading field values into a typed object) instead of passing the form via an `action={...}` prop.

```ts
// Good
export async function renameWorkoutAction(workoutId: string, name: string) { ... }

// Bad — do not do this
export async function renameWorkoutAction(formData: FormData) { ... }
```

## Validation: Zod on every server action

**Every server action must validate its arguments with [Zod](https://zod.dev/) before doing anything else. This is incredibly important.**

```
npm install zod
```

- Define a schema for the action's arguments and `.parse()` (or `.safeParse()`) them as the first step in the action body.
- If validation fails, the action should throw (or return an error result if the caller needs to handle it) — never proceed with unvalidated input.

```ts
// app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.date();

export async function createWorkoutAction(startedAt: Date) {
  const validStartedAt = createWorkoutSchema.parse(startedAt);
  return createWorkout(validStartedAt);
}
```

## Redirects: client side only, never `redirect()` in a server action

- Server actions must **never** call Next.js's `redirect()`. Return the result from the action and navigate from the client (e.g. `useRouter().push(...)`) after the call resolves.

```ts
// Good — app/dashboard/workout/new/new-workout-form.tsx
const workout = await createWorkoutAction(name, startedAt);
router.push(`/dashboard?date=${format(workout.startedAt, "yyyy-MM-dd")}`);

// Bad — do not do this
// app/dashboard/workout/new/actions.ts
"use server";
import { redirect } from "next/navigation";

export async function createWorkoutAction(name: string, startedAt: Date) {
  const workout = await createWorkout(name, startedAt);
  redirect(`/dashboard?date=${workout.startedAt}`); // never redirect from a server action
}
```

## Database access: Drizzle ORM via `/data` helpers only

- Server actions never touch `db` or Drizzle directly. All mutation logic lives in a helper function inside the `/data` directory, same as read queries (see [data-fetching.md](./data-fetching.md)).
- The server action's job is: validate input with Zod, call the `/data` helper, return the result. No query logic in `actions.ts`.
- `/data` helpers use Drizzle ORM query builders only — no raw SQL.
- Any helper that writes user-owned rows (`workouts` and anything joined off them) must scope the write to the current user via `auth()` from Clerk, same as read helpers — never trust a client-supplied user ID.

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.insert(workouts).values({ userId, startedAt }).returning();
}
```
