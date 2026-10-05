"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1),
  startedAt: z.date(),
});

export async function updateWorkoutAction(
  workoutId: string,
  name: string,
  startedAt: Date
) {
  const valid = updateWorkoutSchema.parse({ workoutId, name, startedAt });
  return updateWorkout(valid.workoutId, valid.name, valid.startedAt);
}
