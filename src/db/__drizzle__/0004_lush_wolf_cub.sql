ALTER TABLE `patient` ADD `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` ADD CONSTRAINT `patient_slug_unique` UNIQUE(`slug`);