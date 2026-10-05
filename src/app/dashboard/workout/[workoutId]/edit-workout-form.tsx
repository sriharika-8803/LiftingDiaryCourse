"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateWorkoutAction } from "./actions";

export function EditWorkoutForm({
  workoutId,
  name: initialName,
  startedAt: initialStartedAt,
}: {
  workoutId: string;
  name: string;
  startedAt: Date;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [startedAt, setStartedAt] = useState(() =>
    format(initialStartedAt, "yyyy-MM-dd'T'HH:mm")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const workout = await updateWorkoutAction(
      workoutId,
      name,
      new Date(startedAt)
    );
    router.push(`/dashboard?date=${format(workout.startedAt, "yyyy-MM-dd")}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              placeholder="Enter workout name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="startedAt">Start Time</Label>
            <Input
              id="startedAt"
              type="datetime-local"
              value={startedAt}
              onChange={(event) => setStartedAt(event.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
