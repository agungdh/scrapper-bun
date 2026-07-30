CREATE TABLE `one_piece` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`episode` integer NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`url` text NOT NULL,
	`download_url` text NOT NULL,
	`scraped_at` text NOT NULL
);
