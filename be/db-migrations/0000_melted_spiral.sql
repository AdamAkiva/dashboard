DO $$ BEGIN
 CREATE TYPE "gender" AS ENUM('male', 'female', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_credentials" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(512) NOT NULL,
	"password" varchar(256) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_credentials_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(512) NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"phone" varchar(64) NOT NULL,
	"gender" "gender" NOT NULL,
	"address" varchar(256) NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"dark_mode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "credentials_email_unq_idx" ON "users_credentials" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "credentials_unq_idx" ON "users_credentials" ("email","password");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_unq_idx" ON "users" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_credentials" ADD CONSTRAINT "users_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_settings" ADD CONSTRAINT "users_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
