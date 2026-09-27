import { differenceInMinutes, parse } from "date-fns";

import { DashboardCalendar } from "@/components/dashboard-calendar";
import { getWorkouts } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? parse(dateParam, "yyyy-MM-dd", new Date()) : new Date();

  const workouts = await getWorkouts(date);

  const data = workouts.map((workout) => ({
    id: workout.id,
    name: workout.name,
    date: workout.startedAt,
    exercises: workout.workoutExercises.map((workoutExercise) => ({
      id: workoutExercise.id,
      name: workoutExercise.exercise.name,
    })),
    durationMinutes: workout.completedAt
      ? differenceInMinutes(workout.completedAt, workout.startedAt)
      : null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">Workout Dashboard</h1>
      <DashboardCalendar workouts={data} date={date} />
    </div>
  );
}
