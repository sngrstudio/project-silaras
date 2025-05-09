RENAME TABLE `village_on_watch` TO `region_on_watch`;--> statement-breakpoint
RENAME TABLE `village_on_watch_view` TO `region_on_watch_view`;--> statement-breakpoint
ALTER TABLE `region_on_watch` DROP FOREIGN KEY `village_on_watch_regionId_region_id_fk`;
--> statement-breakpoint
ALTER TABLE `region_on_watch` DROP FOREIGN KEY `village_on_watch_userId_user_profile_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `region_on_watch` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `role` enum('ADMINISTRATOR','COORDINATOR','USER','VIEWER') NOT NULL;--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD PRIMARY KEY(`regionId`,`userId`);--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD CONSTRAINT `region_on_watch_regionId_region_id_fk` FOREIGN KEY (`regionId`) REFERENCES `region`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `region_on_watch` ADD CONSTRAINT `region_on_watch_userId_user_profile_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user_profile`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE OR REPLACE ALGORITHM = undefined
SQL SECURITY definer
VIEW `region_on_watch_view` AS (select `region`.`id`, `user_profile`.`user_id`, `region`.`name`, `region`.`code`, `user_profile`.`full_name`, `user_profile`.`phone_number` from `region_on_watch` left join `region` on `region`.`id` = `region_on_watch`.`regionId` left join `user_profile` on `user_profile`.`user_id` = `region_on_watch`.`userId`);