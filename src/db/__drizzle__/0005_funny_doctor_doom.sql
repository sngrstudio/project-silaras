ALTER TABLE `region` DROP FOREIGN KEY `region_parent_id_id_fk`;
--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_id_fk` FOREIGN KEY (`parentId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;