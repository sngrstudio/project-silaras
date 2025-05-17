CREATE TABLE `presigned_image_url` (
	`file_name` varchar(255) NOT NULL,
	`presigned_url` varchar(511) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `presigned_image_url_file_name` PRIMARY KEY(`file_name`)
);
--> statement-breakpoint
CREATE TABLE `patient_description` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `patient_description_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` text NOT NULL,
	CONSTRAINT `patient_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient` (
	`id` varchar(255) NOT NULL,
	`name` text NOT NULL,
	`mother_name` text,
	`birth_date` date NOT NULL,
	`description` int NOT NULL,
	`status` int NOT NULL,
	`address` text,
	`phone_number` text,
	`region` varchar(255) NOT NULL,
	CONSTRAINT `patient_id` PRIMARY KEY(`id`),
	CONSTRAINT `patient_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `region_on_watch` (
	`regionId` varchar(255) NOT NULL,
	`userId` varchar(255),
	CONSTRAINT `region_on_watch_regionId_pk` PRIMARY KEY(`regionId`)
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` varchar(255) NOT NULL,
	`code` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`name` text,
	`type` enum('DISTRICT','SUBDISTRICT','VILLAGE') NOT NULL,
	`parentId` varchar(255),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` text NOT NULL,
	`path` text NOT NULL,
	`category` text,
	`access_level` int,
	CONSTRAINT `menu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`property` varchar(255) NOT NULL,
	`value` text NOT NULL,
	CONSTRAINT `settings_property` PRIMARY KEY(`property`)
);
--> statement-breakpoint
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
ALTER TABLE `patient` ADD CONSTRAINT `patient_description_patient_description_id_fk` FOREIGN KEY (`description`) REFERENCES `patient_description`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_status_patient_status_id_fk` FOREIGN KEY (`status`) REFERENCES `patient_status`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_region_region_on_watch_regionId_fk` FOREIGN KEY (`region`) REFERENCES `region_on_watch`(`regionId`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD CONSTRAINT `region_on_watch_regionId_region_id_fk` FOREIGN KEY (`regionId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD CONSTRAINT `region_on_watch_userId_user_profile_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user_profile`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_id_fk` FOREIGN KEY (`parentId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `menu` ADD CONSTRAINT `menu_access_level_access_level_map_id_fk` FOREIGN KEY (`access_level`) REFERENCES `access_level_map`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user_profile` ADD CONSTRAINT `user_profile_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_access_level_access_level_map_id_fk` FOREIGN KEY (`access_level`) REFERENCES `access_level_map`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `patient_view` AS (select `patient`.`id`, `patient`.`name`, `patient`.`mother_name`, `patient`.`birth_date`, `patient`.`address`, `patient`.`phone_number`, `patient_description`.`description` as `patient_description`, `patient_status`.`description` as `patient_status` from `patient` inner join `patient_description` on `patient_description`.`id` = `patient`.`description` inner join `patient_status` on `patient_status`.`id` = `patient`.`status`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `region_on_watch_view` AS (select `region`.`id`, `user_profile`.`user_id`, `region`.`name`, `region`.`code`, `region`.`slug`, `region`.`type`, `region`.`parentId`, `user_profile`.`full_name`, `user_profile`.`phone_number` from `region_on_watch` left join `region` on `region`.`id` = `region_on_watch`.`regionId` left join `user_profile` on `user_profile`.`user_id` = `region_on_watch`.`userId` order by `region`.`type`, `region`.`name`);--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_view` AS (select `user`.`id`, `user`.`user_name`, `user`.`access_level`, `user_profile`.`full_name`, `user_profile`.`phone_number`, `user_profile`.`profile_photo` from `user` inner join `user_profile` on `user_profile`.`user_id` = `user`.`id` order by `user`.`access_level` desc, `user_profile`.`full_name`);