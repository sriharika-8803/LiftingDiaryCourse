ALTER TABLE "exercises" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "sets" ADD COLUMN "restTime" integer;--> statement-breakpoint
ALTER TABLE "sets" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "duration" integer;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;