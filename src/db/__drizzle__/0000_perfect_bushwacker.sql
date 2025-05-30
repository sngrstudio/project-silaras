CREATE TABLE `daily_assesment` (
	`id` varchar(36) NOT NULL,
	`monthly_assesment_id` varchar(36) NOT NULL,
	`date` date NOT NULL,
	`menu_1` varchar(255) NOT NULL,
	`menu_2` varchar(255) NOT NULL,
	CONSTRAINT `daily_assesment_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_assesment_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `monthly_assesment` (
	`id` varchar(36) NOT NULL,
	`month` varchar(255) NOT NULL,
	CONSTRAINT `monthly_assesment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_daily_assesment` (
	`patient_id` varchar(36) NOT NULL,
	`daily_assesment_id` varchar(36) NOT NULL,
	`contains_staple_food` boolean DEFAULT false,
	`contains_side_dish` boolean DEFAULT false,
	`contains_vegetables` boolean DEFAULT false,
	`contains_fruits` boolean DEFAULT false,
	`is_following_recipe` boolean DEFAULT false,
	`score` tinyint unsigned GENERATED ALWAYS AS (`patient_daily_assesment`.`contains_staple_food` + `patient_daily_assesment`.`contains_side_dish` + `patient_daily_assesment`.`contains_vegetables` + `patient_daily_assesment`.`contains_fruits` + `patient_daily_assesment`.`is_following_recipe`) STORED,
	CONSTRAINT `patient_daily_assesment_patient_id_daily_assesment_id_pk` PRIMARY KEY(`patient_id`,`daily_assesment_id`)
);
--> statement-breakpoint
CREATE TABLE `patient_monthly_assesment` (
	`patient_id` varchar(36) NOT NULL,
	`monthly_assesment_id` varchar(36) NOT NULL,
	`weight` double(5,2) NOT NULL,
	`height` double(5,2) NOT NULL,
	`bmi` double(5,2) GENERATED ALWAYS AS (`patient_monthly_assesment`.`weight` / pow(`patient_monthly_assesment`.`height` / 100, 2)) STORED,
	CONSTRAINT `patient_monthly_assesment_patient_id_monthly_assesment_id_pk` PRIMARY KEY(`patient_id`,`monthly_assesment_id`)
);
--> statement-breakpoint
CREATE TABLE `presigned_image_url` (
	`file_name` varchar(255) NOT NULL,
	`presigned_url` varchar(511) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `presigned_image_url_file_name` PRIMARY KEY(`file_name`)
);
--> statement-breakpoint
CREATE TABLE `patient` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`mother_name` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`age` tinyint unsigned GENERATED ALWAYS AS (timestampdiff(month, `patient`.`birth_date`, curdate())) VIRTUAL,
	`status` enum('HAMIL','MENYUSUI','ANAK-ANAK') NOT NULL,
	`phone_number` varchar(255),
	`address` varchar(255),
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`region_id` varchar(36) NOT NULL,
	`initial_weight` double(5,2) NOT NULL DEFAULT 0,
	`initial_height` double(5,2) NOT NULL DEFAULT 0,
	`initial_bmi` double(5,2) GENERATED ALWAYS AS (`patient`.`initial_weight` / pow(`patient`.`initial_height` / 100, 2)) STORED,
	`slug` varchar(255) NOT NULL,
	CONSTRAINT `patient_id` PRIMARY KEY(`id`),
	CONSTRAINT `patient_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`type` enum('KABUPATEN','KECAMATAN','DESA') NOT NULL,
	`parent_id` varchar(36),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site` (
	`property` varchar(255) NOT NULL,
	`value` text NOT NULL,
	CONSTRAINT `site_property` PRIMARY KEY(`property`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(36),
	`expires_at` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`username` varchar(255) NOT NULL,
	`access_level` int NOT NULL DEFAULT 2,
	`password_hash` varchar(255),
	`full_name` varchar(255) NOT NULL,
	`phone_number` varchar(32),
	`profile_photo` varchar(255),
	`region_id` varchar(36) NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`),
	CONSTRAINT `user_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
ALTER TABLE `daily_assesment` ADD CONSTRAINT `fk_daily_monthly` FOREIGN KEY (`monthly_assesment_id`) REFERENCES `monthly_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD CONSTRAINT `fk_patient_daily_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD CONSTRAINT `fk_patient_daily_daily` FOREIGN KEY (`daily_assesment_id`) REFERENCES `daily_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_monthly_assesment` ADD CONSTRAINT `fk_patient_monthly_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_monthly_assesment` ADD CONSTRAINT `fk_patient_monthly_monthly` FOREIGN KEY (`monthly_assesment_id`) REFERENCES `monthly_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_region_id_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_region_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_region_id_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `patient_monthly_assesment_with_total_score` AS (select `patient_monthly_assesment`.`patient_id`, `patient_monthly_assesment`.`monthly_assesment_id`, `patient_monthly_assesment`.`weight`, `patient_monthly_assesment`.`height`, `patient_monthly_assesment`.`bmi`, `monthly_assesment`.`month`, sum(`patient_daily_assesment`.`score`) as `total_score` from `patient_monthly_assesment` inner join `monthly_assesment` on `patient_monthly_assesment`.`monthly_assesment_id` = `monthly_assesment`.`id` left join `patient_daily_assesment` on `patient_monthly_assesment`.`patient_id` = `patient_daily_assesment`.`patient_id` left join `daily_assesment` on `patient_daily_assesment`.`daily_assesment_id` = `daily_assesment`.`id` where `patient_monthly_assesment`.`monthly_assesment_id` = `daily_assesment`.`monthly_assesment_id` group by `patient_monthly_assesment`.`patient_id`, `patient_monthly_assesment`.`monthly_assesment_id`, `patient_monthly_assesment`.`weight`, `patient_monthly_assesment`.`height`, `patient_monthly_assesment`.`bmi`, `monthly_assesment`.`month`);