import { db } from "@/db";
import { exercises, workoutExercises, workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

async function requireOwnedWorkout(workoutId: string, userId: string) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  });
  if (!workout) throw new Error("Workout not found");
  return workout;
}

// Child rows have no userId: ownership comes from the parent workout.
export async function requireOwnedWorkoutExercise(
  workoutExerciseId: string,
  userId: string,
) {
  const row = await db.query.workoutExercises.findFirst({
    where: eq(workoutExercises.id, workoutExerciseId),
    with: { workout: true },
  });
  if (!row || row.workout.userId !== userId) {
    throw new Error("Workout exercise not found");
  }
  return row;
}

export async function getAllExercises() {
  await requireUserId();
  return db.select().from(exercises).orderBy(asc(exercises.name));
}

export async function addExerciseToWorkout(workoutId: string, name: string) {
  const userId = await requireUserId();
  await requireOwnedWorkout(workoutId, userId);

  // Pick-or-create by name; the catalog is shared and not user-scoped.
  // ponytail: exact, case-sensitive match; add a lower(name) unique index if duplicates appear.
  let exercise = await db.query.exercises.findFirst({
    where: eq(exercises.name, name),
  });
  if (!exercise) {
    [exercise] = await db.insert(exercises).values({ name }).returning();
  }

  // ponytail: read-then-insert, racy without transactions (neon-http); fine for one user.
  const existing = await db
    .select({ order: workoutExercises.order })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  const order = existing.reduce((max, row) => Math.max(max, row.order), 0) + 1;

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId: exercise.id, order })
    .returning();
  return workoutExercise;
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  const userId = await requireUserId();
  await requireOwnedWorkoutExercise(workoutExerciseId, userId);

  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

export async function reorderWorkoutExercise(
  workoutExerciseId: string,
  direction: "up" | "down",
) {
  const userId = await requireUserId();
  const current = await requireOwnedWorkoutExercise(workoutExerciseId, userId);

  const siblings = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, current.workoutId))
    .orderBy(asc(workoutExercises.order));
  const index = siblings.findIndex((row) => row.id === workoutExerciseId);
  const neighbour = siblings[direction === "up" ? index - 1 : index + 1];
  if (!neighbour) return;

  // ponytail: two updates, not atomic (no transactions on neon-http).
  await db
    .update(workoutExercises)
    .set({ order: neighbour.order })
    .where(eq(workoutExercises.id, current.id));
  await db
    .update(workoutExercises)
    .set({ order: current.order })
    .where(eq(workoutExercises.id, neighbour.id));
}
