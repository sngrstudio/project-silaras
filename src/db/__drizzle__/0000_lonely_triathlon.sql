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
	`role` enum('ADMINISTRATOR','USER','VIEWER') NOT NULL,
	`password_hash` varchar(255),
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_user_name_unique` UNIQUE(`user_name`)
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` varchar(255) NOT NULL,
	`code` varchar(255),
	`name` text,
	`type` enum('DISTRICT','SUBDISTRICT','VILLAGE') NOT NULL DEFAULT 'VILLAGE',
	`parentId` varchar(255),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `village_on_watch` (
	`regionId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `village_on_watch_regionId_userId_pk` PRIMARY KEY(`regionId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`property` varchar(255) NOT NULL,
	`value` text NOT NULL,
	CONSTRAINT `settings_property` PRIMARY KEY(`property`)
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` varchar(255) NOT NULL,
	`full_name` text,
	`phone_number` text DEFAULT (''),
	CONSTRAINT `user_profile_user_id_pk` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_id_fk` FOREIGN KEY (`parentId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `village_on_watch` ADD CONSTRAINT `village_on_watch_regionId_region_id_fk` FOREIGN KEY (`regionId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `village_on_watch` ADD CONSTRAINT `village_on_watch_userId_user_profile_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user_profile`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profile` ADD CONSTRAINT `user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `village_on_watch_view` AS (select `region`.`id`, `user_profile`.`user_id`, `region`.`name`, `region`.`code`, `user_profile`.`full_name`, `user_profile`.`phone_number` from `village_on_watch` left join `region` on `region`.`id` = `village_on_watch`.`regionId` left join `user_profile` on `user_profile`.`user_id` = `village_on_watch`.`userId`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_profile_view` AS (select `user`.`user_name`, `user`.`role`, `user_profile`.`full_name`, `user_profile`.`phone_number` from `user` inner join `user_profile` on `user_profile`.`user_id` = `user`.`id`);