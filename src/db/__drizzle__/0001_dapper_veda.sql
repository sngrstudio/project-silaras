ALTER TABLE `user_profile` ADD `phone_number` text DEFAULT ('');--> statement-breakpoint
ALTER TABLE `user_profile` DROP COLUMN `phoneNumber`;--> statement-breakpoint
CREATE OR REPLACE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_profile_view` AS (select `user`.`user_name`, `user`.`role`, `user_profile`.`full_name`, `user_profile`.`phone_number` from `user` inner join `user_profile` on `user_profile`.`user_id` = `user`.`id`);