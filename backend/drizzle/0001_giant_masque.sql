CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
CREATE TABLE "workout_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"duration" integer,
	"distance" numeric(10, 2),
	"elevation" integer,
	"laps" integer
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "custom_emoji" varchar(10);--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "custom_name" varchar(100);--> statement-breakpoint
ALTER TABLE "workout_details" ADD CONSTRAINT "workout_details_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;