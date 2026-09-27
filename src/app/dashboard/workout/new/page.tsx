import { NewWorkoutForm } from "./new-workout-form";

export default function NewWorkoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">Create New Workout</h1>
      <div className="w-full max-w-md">
        <NewWorkoutForm />
      </div>
    </div>
  );
}
