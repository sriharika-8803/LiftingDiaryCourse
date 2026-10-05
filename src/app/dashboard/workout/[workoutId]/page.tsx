import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAllExercises } from "@/data/exercises";
import { getWorkout } from "@/data/workouts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { EditWorkoutForm } from "./edit-workout-form";
import { WorkoutExercises } from "./workout-exercises";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workout = await getWorkout(workoutId);
  if (!workout) notFound();
  const catalog = await getAllExercises();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href="/dashboard" />}
      >
        <ArrowLeft data-icon="inline-start" />
        Back to Dashboard
      </Button>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{workout.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{format(workout.startedAt, "do MMM yyyy, h:mm a")}</span>
          <Badge variant={workout.completedAt ? "secondary" : "outline"}>
            {workout.completedAt ? "Completed" : "In progress"}
          </Badge>
        </div>
      </div>
      <WorkoutExercises
        workoutId={workout.id}
        exercises={workout.workoutExercises}
        catalog={catalog.map((exercise) => exercise.name)}
        isCompleted={workout.completedAt !== null}
      />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Workout Details</h2>
          <p className="text-sm text-muted-foreground">
            Update the name and start time for this workout.
          </p>
        </div>
        <EditWorkoutForm
          workoutId={workout.id}
          name={workout.name}
          startedAt={workout.startedAt}
        />
      </div>
    </div>
  );
}
