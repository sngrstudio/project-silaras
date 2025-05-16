ALTER TABLE `presigned_image_url` MODIFY COLUMN `presigned_url` varchar(511) NOT NULL;--> statement-breakpoint
ALTER TABLE `region` ADD `slug` varchar(255);