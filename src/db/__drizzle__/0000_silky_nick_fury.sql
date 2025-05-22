CREATE TABLE `patient` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`region_id` varchar(36) NOT NULL,
	CONSTRAINT `patient_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `region` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`RegionType` enum('KABUPATEN','KECAMATAN','DESA') NOT NULL,
	`parent_id` varchar(36),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_region_id_region_id_fk` FOREIGN KEY (`region_id`) REFERENCES `region`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_region_id_fk` FOREIGN KEY (`parent_id`) REFERENCES `region`(`id`) ON DELETE no action ON UPDATE no action;