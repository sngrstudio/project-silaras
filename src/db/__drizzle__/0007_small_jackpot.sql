CREATE TABLE `daily_assesment` (
	`id` varchar(255) NOT NULL,
	`month_id` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`menu_1` varchar(255),
	`menu_2` varchar(255),
	`contains_staple_food` boolean,
	`contains_side_dish` boolean,
	`contains_vegetables` boolean,
	`contains_fruits` boolean,
	`is_following_recipe` boolean,
	CONSTRAINT `daily_assesment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_assesment` (
	`id` varchar(255) NOT NULL,
	`patient_id` varchar(255) NOT NULL,
	`month` varchar(255) NOT NULL,
	`weight` double NOT NULL,
	`height` double NOT NULL,
	CONSTRAINT `monthly_assesment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `patient` ADD `initial_weight` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` ADD `initial_height` double DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `daily_assesment` ADD CONSTRAINT `daily_assesment_month_id_monthly_assesment_id_fk` FOREIGN KEY (`month_id`) REFERENCES `monthly_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `monthly_assesment` ADD CONSTRAINT `monthly_assesment_patient_id_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patient`(`id`) ON DELETE cascade ON UPDATE cascade;