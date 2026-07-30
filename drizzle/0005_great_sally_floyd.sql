CREATE TABLE `github_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`repo` text NOT NULL,
	`tag_name` text NOT NULL,
	`scraped_at` text NOT NULL
);
