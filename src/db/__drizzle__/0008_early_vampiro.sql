ALTER TABLE `daily_assesment` MODIFY COLUMN `contains_staple_food` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `daily_assesment` MODIFY COLUMN `contains_side_dish` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `daily_assesment` MODIFY COLUMN `contains_vegetables` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `daily_assesment` MODIFY COLUMN `contains_fruits` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `daily_assesment` MODIFY COLUMN `is_following_recipe` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `daily_assesment` ADD `score` tinyint GENERATED ALWAYS AS (`daily_assesment`.`contains_staple_food` + `daily_assesment`.`contains_side_dish` + `daily_assesment`.`contains_vegetables` + `daily_assesment`.`contains_fruits` + `daily_assesment`.`is_following_recipe`) VIRTUAL;