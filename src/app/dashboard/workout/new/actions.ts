"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  startedAt: z.date(),
});

export async function createWorkoutAction(name: string, startedAt: Date) {
  const valid = createWorkoutSchema.parse({ name, startedAt });
  return createWorkout(valid.name, valid.startedAt);
}
