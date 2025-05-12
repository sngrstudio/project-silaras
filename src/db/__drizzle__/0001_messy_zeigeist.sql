CREATE TABLE `region_on_watch` (
	`regionId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `region_on_watch_regionId_pk` PRIMARY KEY(`regionId`)
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` varchar(255) NOT NULL,
	`code` varchar(255),
	`name` text,
	`type` enum('DISTRICT','SUBDISTRICT','VILLAGE') NOT NULL,
	`parentId` varchar(255),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD CONSTRAINT `region_on_watch_regionId_region_id_fk` FOREIGN KEY (`regionId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD CONSTRAINT `region_on_watch_userId_user_profile_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user_profile`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_id_fk` FOREIGN KEY (`parentId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `region_on_watch_view` AS (select `region`.`id`, `user_profile`.`user_id`, `region`.`name`, `region`.`code`, `user_profile`.`full_name`, `user_profile`.`phone_number` from `region_on_watch` left join `region` on `region`.`id` = `region_on_watch`.`regionId` left join `user_profile` on `user_profile`.`user_id` = `region_on_watch`.`userId`);