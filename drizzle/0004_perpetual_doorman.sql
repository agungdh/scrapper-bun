PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_one_piece_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`episode_id` integer NOT NULL,
	`file_id` text NOT NULL,
	`name` text NOT NULL,
	`size` integer NOT NULL,
	`link` text NOT NULL,
	`mimetype` text,
	`thumbnail` text,
	FOREIGN KEY (`episode_id`) REFERENCES `one_piece`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_one_piece_files`("id", "episode_id", "file_id", "name", "size", "link", "mimetype", "thumbnail") SELECT "id", "episode_id", "file_id", "name", "size", "link", "mimetype", "thumbnail" FROM `one_piece_files`;--> statement-breakpoint
DROP TABLE `one_piece_files`;--> statement-breakpoint
ALTER TABLE `__new_one_piece_files` RENAME TO `one_piece_files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_one_piece_files_episode_id` ON `one_piece_files` (`episode_id`);