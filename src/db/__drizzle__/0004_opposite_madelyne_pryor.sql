CREATE TABLE `region` (
	`id` varchar(255) NOT NULL,
	`code` text,
	`name` text,
	`parentId` varchar(255),
	CONSTRAINT `region_id` PRIMARY KEY(`id`),
	CONSTRAINT `region_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `region` ADD CONSTRAINT `region_parent_id_id_fk` FOREIGN KEY (`parentId`) REFERENCES `region`(`id`) ON DELETE no action ON UPDATE no action;