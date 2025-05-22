ALTER TABLE `patient` ADD `mother_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` ADD `birth_date` date NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` ADD `PatientStatus` enum('HAMIL','MENYUSUI','ANAK-ANAK') NOT NULL;--> statement-breakpoint
ALTER TABLE `patient` ADD `location` json NOT NULL;