import { db } from "@/db";
import { sets } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { requireOwnedWorkoutExercise } from "./exercises";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

async function requireOwnedSet(setId: string, userId: string) {
  const row = await db.query.sets.findFirst({
    where: eq(sets.id, setId),
    with: { workoutExercise: { with: { workout: true } } },
  });
  if (!row || row.workoutExercise.workout.userId !== userId) {
    throw new Error("Set not found");
  }
  return row;
}

export async function addSet(
  workoutExerciseId: string,
  weight: number | null,
  reps: number,
) {
  const userId = await requireUserId();
  await requireOwnedWorkoutExercise(workoutExerciseId, userId);

  // ponytail: read-then-insert, racy without transactions (neon-http); fine for one user.
  const existing = await db
    .select({ setNumber: sets.setNumber })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));
  const setNumber =
    existing.reduce((max, row) => Math.max(max, row.setNumber), 0) + 1;

  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber,
      weight: weight === null ? null : String(weight),
      reps,
    })
    .returning();
  return set;
}

export async function updateSet(
  setId: string,
  weight: number | null,
  reps: number,
) {
  const userId = await requireUserId();
  await requireOwnedSet(setId, userId);

  const [set] = await db
    .update(sets)
    .set({ weight: weight === null ? null : String(weight), reps })
    .where(eq(sets.id, setId))
    .returning();
  return set;
}

export async function deleteSet(setId: string) {
  const userId = await requireUserId();
  await requireOwnedSet(setId, userId);

  await db.delete(sets).where(eq(sets.id, setId));
}
