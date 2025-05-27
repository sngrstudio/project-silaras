ALTER TABLE `patient` drop column `age`;--> statement-breakpoint
ALTER TABLE `patient` ADD `age` tinyint unsigned GENERATED ALWAYS AS (timestampdiff(month, `patient`.`birth_date`, curdate())) VIRTUAL;