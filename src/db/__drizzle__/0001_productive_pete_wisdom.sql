ALTER TABLE `patient` ADD `latitude` double NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` ADD `longitude` double NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` DROP COLUMN `location`;