"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Dumbbell,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  addExerciseAction,
  addSetAction,
  completeWorkoutAction,
  deleteSetAction,
  removeExerciseAction,
  reorderExerciseAction,
  updateSetAction,
} from "./actions";

type WorkoutSet = {
  id: string;
  setNumber: number;
  weight: string | null;
  reps: number | null;
};

type WorkoutExercise = {
  id: string;
  exercise: { name: string };
  sets: WorkoutSet[];
};

type Run = (task: () => Promise<unknown>) => void;

// "" -> null weight (bodyweight); anything else must be a number. Reps are required.
function parseSet(weight: string, reps: string) {
  const parsedReps = Number(reps);
  if (reps.trim() === "" || !Number.isInteger(parsedReps) || parsedReps <= 0) {
    return null;
  }
  const parsedWeight = weight.trim() === "" ? null : Number(weight);
  if (parsedWeight !== null && Number.isNaN(parsedWeight)) return null;
  return { weight: parsedWeight, reps: parsedReps };
}

function SetRow({ set, run }: { set: WorkoutSet; run: Run }) {
  const [weight, setWeight] = useState(set.weight ?? "");
  const [reps, setReps] = useState(String(set.reps ?? ""));

  function save() {
    const parsed = parseSet(weight, reps);
    // Restore the saved values if the edit is invalid or unchanged.
    if (!parsed) {
      setWeight(set.weight ?? "");
      setReps(String(set.reps ?? ""));
      return;
    }
    if (
      parsed.weight === (set.weight === null ? null : Number(set.weight)) &&
      parsed.reps === set.reps
    ) {
      return;
    }
    run(() => updateSetAction(set.id, parsed.weight, parsed.reps));
  }

  return (
    <TableRow>
      <TableCell>{set.setNumber}</TableCell>
      <TableCell>
        <Input
          type="number"
          min="0"
          step="any"
          aria-label={`Set ${set.setNumber} weight`}
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          onBlur={save}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min="1"
          step="1"
          aria-label={`Set ${set.setNumber} reps`}
          value={reps}
          onChange={(event) => setReps(event.target.value)}
          onBlur={save}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete set ${set.setNumber}`}
          onClick={() => run(() => deleteSetAction(set.id))}
        >
          <Trash2 />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function AddSetRow({
  workoutExerciseId,
  nextNumber,
  run,
}: {
  workoutExerciseId: string;
  nextNumber: number;
  run: Run;
}) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  function add(event: React.FormEvent) {
    event.preventDefault();
    const parsed = parseSet(weight, reps);
    if (!parsed) return;
    run(() => addSetAction(workoutExerciseId, parsed.weight, parsed.reps));
    setWeight("");
    setReps("");
  }

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{nextNumber}</TableCell>
      <TableCell>
        <Input
          form={`add-set-${workoutExerciseId}`}
          type="number"
          min="0"
          step="any"
          placeholder="Weight"
          aria-label="New set weight"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
      </TableCell>
      <TableCell>
        <Input
          form={`add-set-${workoutExerciseId}`}
          type="number"
          min="1"
          step="1"
          placeholder="Reps"
          aria-label="New set reps"
          value={reps}
          onChange={(event) => setReps(event.target.value)}
          required
        />
      </TableCell>
      <TableCell className="text-right">
        <form id={`add-set-${workoutExerciseId}`} onSubmit={add}>
          <Button type="submit" size="sm">
            Add Set
          </Button>
        </form>
      </TableCell>
    </TableRow>
  );
}

export function WorkoutExercises({
  workoutId,
  exercises,
  catalog,
  isCompleted,
}: {
  workoutId: string;
  exercises: WorkoutExercise[];
  catalog: string[];
  isCompleted: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  // One place for pending/error handling; the server component refetches on refresh.
  const run: Run = (task) => {
    setError(null);
    startTransition(async () => {
      try {
        await task();
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  function addExercise(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    run(() => addExerciseAction(workoutId, trimmed));
    setName("");
  }

  return (
    <div className="flex flex-col gap-4" aria-busy={isPending}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Exercises &amp; Sets</h2>
          <p className="text-sm text-muted-foreground">
            Add exercises, then log the weight and reps for each set.
          </p>
        </div>
        <Button
          variant={isCompleted ? "outline" : "default"}
          disabled={isPending || isCompleted}
          onClick={() => run(() => completeWorkoutAction(workoutId))}
        >
          <CheckCircle2 data-icon="inline-start" />
          {isCompleted ? "Completed" : "Complete Workout"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {exercises.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
            <Dumbbell className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No exercises yet. Add your first one below.
            </p>
          </CardContent>
        </Card>
      )}

      {exercises.map((workoutExercise, index) => (
        <Card key={workoutExercise.id}>
          <CardHeader className="flex-row items-center justify-between">
            <span className="font-medium">{workoutExercise.exercise.name}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Move exercise up"
                disabled={isPending || index === 0}
                onClick={() =>
                  run(() => reorderExerciseAction(workoutExercise.id, "up"))
                }
              >
                <ArrowUp />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Move exercise down"
                disabled={isPending || index === exercises.length - 1}
                onClick={() =>
                  run(() => reorderExerciseAction(workoutExercise.id, "down"))
                }
              >
                <ArrowDown />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${workoutExercise.exercise.name}`}
                disabled={isPending}
                onClick={() =>
                  run(() => removeExerciseAction(workoutExercise.id))
                }
              >
                <Trash2 />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Set</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Reps</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {workoutExercise.sets.map((set) => (
                  // Key includes the saved values so edits from the server reset the row state.
                  <SetRow
                    key={`${set.id}-${set.weight}-${set.reps}`}
                    set={set}
                    run={run}
                  />
                ))}
                <AddSetRow
                  workoutExerciseId={workoutExercise.id}
                  nextNumber={
                    workoutExercise.sets.reduce(
                      (max, set) => Math.max(max, set.setNumber),
                      0,
                    ) + 1
                  }
                  run={run}
                />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent>
          <form onSubmit={addExercise} className="flex flex-col gap-2">
            <Label htmlFor="exercise-name">Add Exercise</Label>
            <div className="flex gap-2">
              <Input
                id="exercise-name"
                list="exercise-catalog"
                placeholder="Pick from the list or type a new exercise"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <datalist id="exercise-catalog">
                {catalog.map((exerciseName) => (
                  <option key={exerciseName} value={exerciseName} />
                ))}
              </datalist>
              <Button type="submit" disabled={isPending || !name.trim()}>
                Add Exercise
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
