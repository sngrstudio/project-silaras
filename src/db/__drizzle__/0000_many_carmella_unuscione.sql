CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`role` enum('SYSTEM','ADMINISTRATOR','USER','VIEWER') NOT NULL,
	`password_hash` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_user_name_unique` UNIQUE(`user_name`)
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` varchar(255) NOT NULL,
	`full_name` text,
	`phoneNumber` text,
	CONSTRAINT `user_profile_user_id_pk` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_profile` ADD CONSTRAINT `user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_profile_view` AS (select `user`.`user_name`, `user`.`role`, `user_profile`.`full_name`, `user_profile`.`phoneNumber` from `user` inner join `user_profile` on `user_profile`.`user_id` = `user`.`id`);