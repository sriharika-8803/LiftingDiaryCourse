import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, gte, lte } from "drizzle-orm";
import { endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}

export async function getWorkout(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!uuidSchema.safeParse(workoutId).success) return undefined;

  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exercise: true,
          sets: { orderBy: (sets, { asc }) => [asc(sets.setNumber)] },
        },
      },
    },
  });
}

export async function completeWorkout(workoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .update(workouts)
    .set({ completedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export async function updateWorkout(
  workoutId: string,
  name: string,
  startedAt: Date
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [workout] = await db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export async function getWorkouts(date: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay(date)),
      lte(workouts.startedAt, endOfDay(date))
    ),
    orderBy: (workouts, { asc }) => [asc(workouts.startedAt)],
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exercise: true,
        },
      },
    },
  });
}
