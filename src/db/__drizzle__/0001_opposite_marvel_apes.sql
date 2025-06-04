DROP TABLE `presigned_image_url`;--> statement-breakpoint
RENAME TABLE `patient_daily_assesment` TO `target_daily_assesment`;--> statement-breakpoint
RENAME TABLE `patient_monthly_assesment` TO `target_monthly_assesment`;--> statement-breakpoint
RENAME TABLE `patient` TO `target`;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` RENAME COLUMN `patient_id` TO `target_id`;--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` RENAME COLUMN `patient_id` TO `target_id`;--> statement-breakpoint
RENAME TABLE `patient_monthly_assesment_with_total_score` TO `target_monthly_assesment_with_total_score`;--> statement-breakpoint
ALTER TABLE `target` DROP INDEX `patient_slug_unique`;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` DROP FOREIGN KEY `fk_patient_daily_patient`;
--> statement-breakpoint
ALTER TABLE `target_daily_assesment` DROP FOREIGN KEY `fk_patient_daily_daily`;
--> statement-breakpoint
ALTER TABLE `target_daily_assesment` DROP FOREIGN KEY `fk_patient_daily_last_modified_by`;
--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` DROP FOREIGN KEY `fk_patient_monthly_patient`;
--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` DROP FOREIGN KEY `fk_patient_monthly_monthly`;
--> statement-breakpoint
ALTER TABLE `target` DROP FOREIGN KEY `patient_region_id_region_id_fk`;
--> statement-breakpoint
ALTER TABLE `target_daily_assesment` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `target` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` drop column `score`;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` ADD `score` tinyint unsigned GENERATED ALWAYS AS (`target_daily_assesment`.`contains_staple_food` + `target_daily_assesment`.`contains_side_dish` + `target_daily_assesment`.`contains_vegetables` + `target_daily_assesment`.`contains_fruits` + `target_daily_assesment`.`is_following_recipe`) STORED;--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` drop column `bmi`;--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` ADD `bmi` double(5,2) GENERATED ALWAYS AS (`target_monthly_assesment`.`weight` / pow(`target_monthly_assesment`.`height` / 100, 2)) STORED;--> statement-breakpoint
ALTER TABLE `target` drop column `age`;--> statement-breakpoint
ALTER TABLE `target` ADD `age` tinyint unsigned GENERATED ALWAYS AS (timestampdiff(month, `target`.`birth_date`, curdate())) VIRTUAL;--> statement-breakpoint
ALTER TABLE `target` drop column `initial_bmi`;--> statement-breakpoint
ALTER TABLE `target` ADD `initial_bmi` double(5,2) GENERATED ALWAYS AS (`target`.`initial_weight` / pow(`target`.`initial_height` / 100, 2)) STORED;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` ADD PRIMARY KEY(`target_id`,`daily_assesment_id`);--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` ADD PRIMARY KEY(`target_id`,`monthly_assesment_id`);--> statement-breakpoint
ALTER TABLE `target` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `target` ADD CONSTRAINT `target_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `target_daily_assesment` ADD CONSTRAINT `fk_target_daily_target` FOREIGN KEY (`target_id`) REFERENCES `target`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` ADD CONSTRAINT `fk_target_daily_daily` FOREIGN KEY (`daily_assesment_id`) REFERENCES `daily_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `target_daily_assesment` ADD CONSTRAINT `fk_target_daily_last_modified_by` FOREIGN KEY (`last_modified_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` ADD CONSTRAINT `fk_target_monthly_target` FOREIGN KEY (`target_id`) REFERENCES `target`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `target_monthly_assesment` ADD CONSTRAINT `fk_target_monthly_monthly` FOREIGN KEY (`monthly_assesment_id`) REFERENCES `monthly_assesment`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `target` ADD CONSTRAINT `target_region_id_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE OR REPLACE ALGORITHM = undefined
SQL SECURITY definer
VIEW `target_monthly_assesment_with_total_score` AS (select `target_monthly_assesment`.`target_id`, `target_monthly_assesment`.`monthly_assesment_id`, `target_monthly_assesment`.`weight`, `target_monthly_assesment`.`height`, `target_monthly_assesment`.`bmi`, `monthly_assesment`.`month`, sum(`target_daily_assesment`.`score`) as `total_score` from `target_monthly_assesment` inner join `monthly_assesment` on `target_monthly_assesment`.`monthly_assesment_id` = `monthly_assesment`.`id` left join `target_daily_assesment` on `target_monthly_assesment`.`target_id` = `target_daily_assesment`.`target_id` left join `daily_assesment` on `target_daily_assesment`.`daily_assesment_id` = `daily_assesment`.`id` where `target_monthly_assesment`.`monthly_assesment_id` = `daily_assesment`.`monthly_assesment_id` group by `target_monthly_assesment`.`target_id`, `target_monthly_assesment`.`monthly_assesment_id`, `target_monthly_assesment`.`weight`, `target_monthly_assesment`.`height`, `target_monthly_assesment`.`bmi`, `monthly_assesment`.`month`);