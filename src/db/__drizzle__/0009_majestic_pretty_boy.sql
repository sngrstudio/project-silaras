ALTER TABLE `village_on_watch` DROP FOREIGN KEY `village_on_watch_regionId_region_id_fk`;
--> statement-breakpoint
ALTER TABLE `village_on_watch` ADD CONSTRAINT `village_on_watch_regionId_region_id_fk` FOREIGN KEY (`regionId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;