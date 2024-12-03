DROP INDEX IF EXISTS "created_by_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
ALTER TABLE "blaze_post" ADD COLUMN "content" varchar(256);--> statement-breakpoint
ALTER TABLE "blaze_post" ADD COLUMN "likes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "blaze_post" ADD COLUMN "comments" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "blaze_post" ADD COLUMN "reposts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "blaze_post" DROP COLUMN IF EXISTS "name";