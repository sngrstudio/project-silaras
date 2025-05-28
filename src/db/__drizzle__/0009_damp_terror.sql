ALTER TABLE `patient_monthly_assesment` MODIFY COLUMN `weight` double(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient_monthly_assesment` MODIFY COLUMN `height` double(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient_monthly_assesment` MODIFY COLUMN `bmi` double(5,2) GENERATED ALWAYS AS (`patient_monthly_assesment`.`weight` / pow(`patient_monthly_assesment`.`height` / 100, 2)) STORED;--> statement-breakpoint
ALTER TABLE `patient` MODIFY COLUMN `initial_weight` double(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` MODIFY COLUMN `initial_height` double(5,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` MODIFY COLUMN `initial_bmi` double(5,2) GENERATED ALWAYS AS (`patient`.`initial_weight` / pow(`patient`.`initial_height` / 100, 2)) STORED;