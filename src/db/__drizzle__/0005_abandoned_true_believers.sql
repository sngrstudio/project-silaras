CREATE OR REPLACE ALGORITHM = undefined
SQL SECURITY definer
VIEW `user_view` AS (select `user`.`id`, `user`.`user_name`, `user_profile`.`full_name`, `user_profile`.`phone_number`, `user_profile`.`profile_photo` from `user` inner join `user_profile` on `user_profile`.`user_id` = `user`.`id`);