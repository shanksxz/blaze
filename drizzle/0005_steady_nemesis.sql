ALTER TABLE "blaze_comment" DROP COLUMN IF EXISTS "likes";--> statement-breakpoint
ALTER TABLE "blaze_comment" DROP COLUMN IF EXISTS "comments";--> statement-breakpoint
ALTER TABLE "blaze_post" DROP COLUMN IF EXISTS "likes";--> statement-breakpoint
ALTER TABLE "blaze_post" DROP COLUMN IF EXISTS "comments";--> statement-breakpoint
ALTER TABLE "blaze_post" DROP COLUMN IF EXISTS "reposts";--> statement-breakpoint
ALTER TABLE "blaze_user" DROP COLUMN IF EXISTS "posts";--> statement-breakpoint
ALTER TABLE "blaze_user" DROP COLUMN IF EXISTS "followers";--> statement-breakpoint
ALTER TABLE "blaze_user" DROP COLUMN IF EXISTS "following";