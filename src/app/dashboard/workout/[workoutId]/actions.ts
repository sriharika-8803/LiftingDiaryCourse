"use server";

import { z } from "zod";
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  reorderWorkoutExercise,
} from "@/data/exercises";
import { addSet, deleteSet, updateSet } from "@/data/sets";
import { completeWorkout, updateWorkout } from "@/data/workouts";

const idSchema = z.uuid();
const weightSchema = z.number().nonnegative().max(9999).nullable();
const repsSchema = z.number().int().positive().max(1000);

const updateWorkoutSchema = z.object({
  workoutId: idSchema,
  name: z.string().min(1),
  startedAt: z.date(),
});

export async function updateWorkoutAction(
  workoutId: string,
  name: string,
  startedAt: Date,
) {
  const valid = updateWorkoutSchema.parse({ workoutId, name, startedAt });
  return updateWorkout(valid.workoutId, valid.name, valid.startedAt);
}

export async function completeWorkoutAction(workoutId: string) {
  return completeWorkout(idSchema.parse(workoutId));
}

const addExerciseSchema = z.object({
  workoutId: idSchema,
  name: z.string().trim().min(1).max(100),
});

export async function addExerciseAction(workoutId: string, name: string) {
  const valid = addExerciseSchema.parse({ workoutId, name });
  return addExerciseToWorkout(valid.workoutId, valid.name);
}

export async function removeExerciseAction(workoutExerciseId: string) {
  return removeExerciseFromWorkout(idSchema.parse(workoutExerciseId));
}

const reorderSchema = z.object({
  workoutExerciseId: idSchema,
  direction: z.enum(["up", "down"]),
});

export async function reorderExerciseAction(
  workoutExerciseId: string,
  direction: "up" | "down",
) {
  const valid = reorderSchema.parse({ workoutExerciseId, direction });
  return reorderWorkoutExercise(valid.workoutExerciseId, valid.direction);
}

const addSetSchema = z.object({
  workoutExerciseId: idSchema,
  weight: weightSchema,
  reps: repsSchema,
});

export async function addSetAction(
  workoutExerciseId: string,
  weight: number | null,
  reps: number,
) {
  const valid = addSetSchema.parse({ workoutExerciseId, weight, reps });
  return addSet(valid.workoutExerciseId, valid.weight, valid.reps);
}

const updateSetSchema = z.object({
  setId: idSchema,
  weight: weightSchema,
  reps: repsSchema,
});

export async function updateSetAction(
  setId: string,
  weight: number | null,
  reps: number,
) {
  const valid = updateSetSchema.parse({ setId, weight, reps });
  return updateSet(valid.setId, valid.weight, valid.reps);
}

export async function deleteSetAction(setId: string) {
  return deleteSet(idSchema.parse(setId));
}
