ALTER TABLE `patient` DROP FOREIGN KEY `patient_region_id_region_id_fk`;
--> statement-breakpoint
ALTER TABLE `region` DROP FOREIGN KEY `region_parent_id_region_id_fk`;
--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_region_id_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_region_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE cascade;