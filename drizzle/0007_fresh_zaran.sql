CREATE TABLE `youtube_videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel` text NOT NULL,
	`video_id` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`published_at` text,
	`views` text,
	`scraped_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_youtube_videos_channel` ON `youtube_videos` (`channel`);