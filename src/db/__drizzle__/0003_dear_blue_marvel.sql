ALTER TABLE `user` MODIFY COLUMN `region_id` varchar(36) DEFAULT '';--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD `is_completed` boolean DEFAULT false NOT NULL;