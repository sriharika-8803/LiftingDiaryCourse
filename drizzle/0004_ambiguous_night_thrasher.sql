ALTER TABLE "exercises" ADD COLUMN "muscleGroups" varchar(100);--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "equipmentType" varchar(100);--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD COLUMN "orderInWorkout" integer DEFAULT 0 NOT NULL;