import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getWorkout } from "@/data/workouts";
import { Button } from "@/components/ui/button";

import { EditWorkoutForm } from "./edit-workout-form";

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const workout = await getWorkout(workoutId);
  if (!workout) notFound();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Edit Workout</h1>
        <p className="text-sm text-muted-foreground">
          Update the name and start time for this workout.
        </p>
      </div>
      <div className="w-full max-w-md">
        <EditWorkoutForm
          workoutId={workout.id}
          name={workout.name}
          startedAt={workout.startedAt}
        />
      </div>
    </div>
  );
}
