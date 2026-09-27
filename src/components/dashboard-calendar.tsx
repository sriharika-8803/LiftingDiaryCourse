"use client";

import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { enUS } from "react-day-picker/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Workout = {
  id: string;
  name: string;
  date: Date;
  exercises: { id: string; name: string }[];
  durationMinutes: number | null;
};

export function DashboardCalendar({
  workouts,
  date,
}: {
  workouts: Workout[];
  date: Date;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function handleSelect(selected?: Date) {
    if (!selected) return;
    router.push(`${pathname}?date=${format(selected, "yyyy-MM-dd")}`);
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h2 className="font-medium">Select Date</h2>
        <Card className="w-fit">
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              locale={enUS}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>
        <div className="flex flex-1 flex-col gap-3">
          {workouts.length === 0 ? (
            <Card className="flex-1">
              <CardContent className="flex h-full flex-col items-center justify-center gap-4">
                <p className="text-sm text-muted-foreground">
                  No workouts logged for this date.
                </p>
                <Button>Log New Workout</Button>
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <span className="font-medium">{workout.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(workout.date, "h:mm a")}
                  </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {workout.exercises.map((exercise) => (
                      <Badge key={exercise.id} variant="secondary">
                        {exercise.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {workout.durationMinutes !== null
                      ? `Duration: ${workout.durationMinutes} min`
                      : "In progress"}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
