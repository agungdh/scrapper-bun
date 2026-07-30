CREATE TABLE `scrapes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`chapter` text NOT NULL,
	`date` text NOT NULL,
	`url` text NOT NULL,
	`scraped_at` text NOT NULL
);
