CREATE TABLE `one_piece_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`episode_id` integer NOT NULL,
	`file_id` text NOT NULL,
	`name` text NOT NULL,
	`size` integer NOT NULL,
	`link` text NOT NULL,
	`mimetype` text,
	`thumbnail` text
);
--> statement-breakpoint
ALTER TABLE `one_piece` DROP COLUMN `files`;