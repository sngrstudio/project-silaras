CREATE TABLE `access_level_map` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `access_level_map_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` varchar(255) NOT NULL,
	`full_name` text NOT NULL,
	`phone_number` text,
	`profile_photo` text,
	CONSTRAINT `user_profile_user_id_pk` PRIMARY KEY(`user_id`),
	CONSTRAINT `user_profile_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`access_level` int NOT NULL,
	`password_hash` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_user_name_unique` UNIQUE(`user_name`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profile` ADD CONSTRAINT `user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_access_level_access_level_map_id_fk` FOREIGN KEY (`access_level`) REFERENCES `access_level_map`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_view` AS (select `user`.`id`, `user`.`user_name`, `user_profile`.`full_name`, `user_profile`.`phone_number`, `user_profile`.`profile_photo`, `access_level_map`.`description` from `user` inner join `user_profile` on `user_profile`.`user_id` = `user`.`id` left join `access_level_map` on `access_level_map`.`id` = `user`.`access_level`);