CREATE TABLE "famous_creator" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"avatar_url" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "famous_creator_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "famous_creator_platform" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"platform" text NOT NULL,
	"handle" text,
	"profile_url" text NOT NULL,
	"avatar_url" text,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"last_scraped_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "famous_creator_platform" ADD CONSTRAINT "famous_creator_platform_creator_id_famous_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."famous_creator"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "famousCreator_username_idx" ON "famous_creator" USING btree ("username");--> statement-breakpoint
CREATE INDEX "famousCreatorPlatform_creatorId_idx" ON "famous_creator_platform" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "famousCreatorPlatform_creatorId_platform_idx" ON "famous_creator_platform" USING btree ("creator_id","platform");