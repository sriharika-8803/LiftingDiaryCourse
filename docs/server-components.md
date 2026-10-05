# Server Components

## `params` and `searchParams`: must be awaited

**In this Next.js version, `params` and `searchParams` are Promises, not plain objects. This is incredibly important — never access them synchronously.**

- Type them as `Promise<...>` and `await` the value before use — for every dynamic route segment (e.g. `[workoutId]`) and every `searchParams` read.
- Don't destructure `params`/`searchParams` directly off the function arguments — await the promise first, then destructure the resolved value.

```tsx
// app/dashboard/workout/[workoutId]/page.tsx
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // ...
}
```

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  // ...
}
```

```tsx
// Bad — do not do this
export default function Page({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // params is a Promise — this destructures the Promise object, not its value
}
```

## Client component pages

A `page.tsx` that is a Client Component (`"use client"`) can't be `async`, so it can't `await` these props. Read them with React's `use()` instead:

```tsx
"use client";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = use(params);
}
```

This project fetches all data in server components (see [data-fetching.md](./data-fetching.md)), so a client component reading `params`/`searchParams` directly should be rare.
