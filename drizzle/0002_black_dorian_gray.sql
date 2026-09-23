ALTER TABLE "workouts" ADD COLUMN "startedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "completedAt" timestamp;