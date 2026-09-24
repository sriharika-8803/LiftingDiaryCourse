"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { enUS } from "react-day-picker/locale";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Workout = {
  id: string;
  name: string;
  date: Date;
  exercises: string[];
  durationMinutes: number;
};

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    date: new Date(new Date().setHours(9, 0, 0, 0)),
    exercises: ["Bench Press", "Pull-ups", "Shoulder Press"],
    durationMinutes: 45,
  },
  {
    id: "2",
    name: "Cardio Session",
    date: new Date(new Date().setHours(18, 0, 0, 0)),
    exercises: ["Treadmill", "Rowing"],
    durationMinutes: 30,
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  const workouts = MOCK_WORKOUTS.filter((workout) =>
    isSameDay(workout.date, date)
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">Workout Dashboard</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Select Date</h2>
          <Card className="w-fit">
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selected) => selected && setDate(selected)}
                locale={enUS}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-medium">Workouts for {format(date, "do MMM yyyy")}</h2>
          <div className="flex flex-col gap-3">
            {workouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No workouts logged for this date.
              </p>
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
                        <Badge key={exercise} variant="secondary">
                          {exercise}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duration: {workout.durationMinutes} min
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
