-- Custom SQL migration file, put your code below! ----
-- Reshapes workouts/exercises/workout_exercises/sets from integer identity
-- PKs + camelCase columns to uuid PKs + snake_case columns (matching
-- src/db/schema.ts), preserving every existing row and relationship.

-- Phase A: add new uuid primary key columns
ALTER TABLE "exercises" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint
ALTER TABLE "sets" ADD COLUMN "new_id" uuid DEFAULT gen_random_uuid() NOT NULL;
--> statement-breakpoint

-- Phase B: add new uuid foreign key columns, backfilled from the old integer ids
ALTER TABLE "workout_exercises" ADD COLUMN "new_workout_id" uuid;
--> statement-breakpoint
UPDATE "workout_exercises" "we" SET "new_workout_id" = "w"."new_id" FROM "workouts" "w" WHERE "w"."id" = "we"."workoutId";
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD COLUMN "new_exercise_id" uuid;
--> statement-breakpoint
UPDATE "workout_exercises" "we" SET "new_exercise_id" = "e"."new_id" FROM "exercises" "e" WHERE "e"."id" = "we"."exerciseId";
--> statement-breakpoint
ALTER TABLE "sets" ADD COLUMN "new_workout_exercise_id" uuid;
--> statement-breakpoint
UPDATE "sets" "s" SET "new_workout_exercise_id" = "we"."new_id" FROM "workout_exercises" "we" WHERE "we"."id" = "s"."workoutExerciseId";
--> statement-breakpoint

-- Phase C: enforce not null now that the new fk columns are backfilled
ALTER TABLE "workout_exercises" ALTER COLUMN "new_workout_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "workout_exercises" ALTER COLUMN "new_exercise_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "sets" ALTER COLUMN "new_workout_exercise_id" SET NOT NULL;
--> statement-breakpoint

-- Phase D: drop old integer ids/fks and columns that no longer exist in the schema
ALTER TABLE "sets" DROP COLUMN "workoutExerciseId";
--> statement-breakpoint
ALTER TABLE "sets" DROP COLUMN "rpe";
--> statement-breakpoint
ALTER TABLE "sets" DROP COLUMN "restTime";
--> statement-breakpoint
ALTER TABLE "sets" DROP COLUMN "notes";
--> statement-breakpoint
ALTER TABLE "sets" DROP CONSTRAINT "sets_pkey";
--> statement-breakpoint
ALTER TABLE "sets" DROP COLUMN "id";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP COLUMN "workoutId";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP COLUMN "exerciseId";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP COLUMN "notes";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_pkey";
--> statement-breakpoint
ALTER TABLE "workout_exercises" DROP COLUMN "id";
--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "description";
--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "muscleGroups";
--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "equipmentType";
--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_pkey";
--> statement-breakpoint
ALTER TABLE "exercises" DROP COLUMN "id";
--> statement-breakpoint
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_pkey";
--> statement-breakpoint
ALTER TABLE "workouts" DROP COLUMN "id";
--> statement-breakpoint

-- Phase E: rename new columns into place, restore constraints, fix up types
ALTER TABLE "exercises" RENAME COLUMN "new_id" TO "id";
--> statement-breakpoint
ALTER TABLE "exercises" ADD PRIMARY KEY ("id");
--> statement-breakpoint
ALTER TABLE "exercises" RENAME COLUMN "createdAt" TO "created_at";
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "exercises" ALTER COLUMN "name" TYPE text;
--> statement-breakpoint
ALTER TABLE "workouts" RENAME COLUMN "new_id" TO "id";
--> statement-breakpoint
ALTER TABLE "workouts" ADD PRIMARY KEY ("id");
--> statement-breakpoint
ALTER TABLE "workouts" RENAME COLUMN "userId" TO "user_id";
--> statement-breakpoint
ALTER TABLE "workouts" ALTER COLUMN "user_id" TYPE text;
--> statement-breakpoint
ALTER TABLE "workouts" ALTER COLUMN "name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "workouts" ALTER COLUMN "name" TYPE text;
--> statement-breakpoint
ALTER TABLE "workouts" RENAME COLUMN "startedAt" TO "started_at";
--> statement-breakpoint
ALTER TABLE "workouts" ALTER COLUMN "started_at" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "workouts" RENAME COLUMN "completedAt" TO "completed_at";
--> statement-breakpoint
ALTER TABLE "workouts" RENAME COLUMN "createdAt" TO "created_at";
--> statement-breakpoint
ALTER TABLE "workouts" RENAME COLUMN "updatedAt" TO "updated_at";
--> statement-breakpoint
ALTER TABLE "workout_exercises" RENAME COLUMN "new_id" TO "id";
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD PRIMARY KEY ("id");
--> statement-breakpoint
ALTER TABLE "workout_exercises" RENAME COLUMN "new_workout_id" TO "workout_id";
--> statement-breakpoint
ALTER TABLE "workout_exercises" RENAME COLUMN "new_exercise_id" TO "exercise_id";
--> statement-breakpoint
ALTER TABLE "workout_exercises" RENAME COLUMN "orderInWorkout" TO "order";
--> statement-breakpoint
ALTER TABLE "workout_exercises" ALTER COLUMN "order" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sets" RENAME COLUMN "new_id" TO "id";
--> statement-breakpoint
ALTER TABLE "sets" ADD PRIMARY KEY ("id");
--> statement-breakpoint
ALTER TABLE "sets" RENAME COLUMN "new_workout_exercise_id" TO "workout_exercise_id";
--> statement-breakpoint
ALTER TABLE "sets" RENAME COLUMN "setNumber" TO "set_number";
--> statement-breakpoint
ALTER TABLE "sets" ALTER COLUMN "reps" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "sets" ALTER COLUMN "weight" TYPE numeric(10, 2);
--> statement-breakpoint
ALTER TABLE "sets" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;
