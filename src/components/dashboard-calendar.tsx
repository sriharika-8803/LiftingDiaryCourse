"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { enUS } from "react-day-picker/locale";
import { CalendarIcon, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

  const [open, setOpen] = useState(false);

  function handleSelect(selected?: Date) {
    if (!selected) return;
    setOpen(false);
    router.push(`${pathname}?date=${format(selected, "yyyy-MM-dd")}`);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/workout/new" />}
          >
            Log New Workout
          </Button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={<Button variant="outline" />}>
              <CalendarIcon />
              {format(date, "do MMM yyyy")}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleSelect}
                locale={enUS}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {workouts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No workouts logged for this date.
              </p>
            </CardContent>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader className="flex-row items-start justify-between">
                <span className="font-medium">{workout.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">
                    {format(workout.date, "h:mm a")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit workout"
                    nativeButton={false}
                    render={<Link href={`/dashboard/workout/${workout.id}`} />}
                  >
                    <Pencil />
                  </Button>
                </div>
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
  );
}
