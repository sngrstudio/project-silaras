CREATE TABLE `village_on_watch` (
	`regionId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	CONSTRAINT `village_on_watch_regionId_userId_pk` PRIMARY KEY(`regionId`,`userId`)
);
--> statement-breakpoint
ALTER TABLE `village_on_watch` ADD CONSTRAINT `village_on_watch_regionId_region_id_fk` FOREIGN KEY (`regionId`) REFERENCES `region`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `village_on_watch` ADD CONSTRAINT `village_on_watch_userId_user_profile_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user_profile`(`user_id`) ON DELETE no action ON UPDATE no action;