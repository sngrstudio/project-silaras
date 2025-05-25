CREATE TABLE `daily_assesment` (
	`id` varchar(255) NOT NULL,
	`monthly_assesment_id` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`menu_1` varchar(255) NOT NULL,
	`menu_2` varchar(255) NOT NULL,
	CONSTRAINT `daily_assesment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_assesment` (
	`id` varchar(255) NOT NULL,
	`month` varchar(255) NOT NULL,
	CONSTRAINT `monthly_assesment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patient_daily_assesment` (
	`patient_id` varchar(255) NOT NULL,
	`daily_assesment_id` varchar(255) NOT NULL,
	`contains_staple_food` boolean DEFAULT false,
	`contains_side_dish` boolean DEFAULT false,
	`contains_vegetables` boolean DEFAULT false,
	`contains_fruits` boolean DEFAULT false,
	`is_following_recipe` boolean DEFAULT false,
	`score` tinyint GENERATED ALWAYS AS (`patient_daily_assesment`.`contains_staple_food` + `patient_daily_assesment`.`contains_side_dish` + `patient_daily_assesment`.`contains_vegetables` + `patient_daily_assesment`.`contains_fruits` + `patient_daily_assesment`.`is_following_recipe`) STORED,
	CONSTRAINT `patient_daily_assesment_patient_id_daily_assesment_id_pk` PRIMARY KEY(`patient_id`,`daily_assesment_id`)
);
--> statement-breakpoint
CREATE TABLE `patient_monthly_assesment` (
	`patient_id` varchar(255) NOT NULL,
	`monthly_assesment_id` varchar(255) NOT NULL,
	`weight` double NOT NULL,
	`height` double NOT NULL,
	CONSTRAINT `patient_monthly_assesment_patient_id_monthly_assesment_id_pk` PRIMARY KEY(`patient_id`,`monthly_assesment_id`)
);
--> statement-breakpoint
CREATE TABLE `patient` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`mother_name` varchar(255) NOT NULL,
	`birth_date` date NOT NULL,
	`status` enum('HAMIL','MENYUSUI','ANAK-ANAK') NOT NULL,
	`location` json NOT NULL,
	`region_id` varchar(36) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`initial_weight` double NOT NULL DEFAULT 0,
	`initial_height` double NOT NULL DEFAULT 0,
	CONSTRAINT `patient_id` PRIMARY KEY(`id`),
	CONSTRAINT `patient_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`type` enum('KABUPATEN','KECAMATAN','DESA') NOT NULL,
	`parent_id` varchar(36),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `daily_assesment` ADD CONSTRAINT `fk_daily_monthly` FOREIGN KEY (`monthly_assesment_id`) REFERENCES `monthly_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD CONSTRAINT `fk_patient_daily_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD CONSTRAINT `fk_patient_daily_daily` FOREIGN KEY (`daily_assesment_id`) REFERENCES `daily_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_monthly_assesment` ADD CONSTRAINT `fk_patient_monthly_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient_monthly_assesment` ADD CONSTRAINT `fk_patient_monthly_monthly` FOREIGN KEY (`monthly_assesment_id`) REFERENCES `monthly_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_region_id_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_region_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;