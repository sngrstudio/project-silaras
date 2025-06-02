ALTER TABLE `patient_daily_assesment` ADD `image` varchar(255);--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD `last_modified_by` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient_daily_assesment` ADD CONSTRAINT `fk_patient_daily_last_modified_by` FOREIGN KEY (`last_modified_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE cascade;