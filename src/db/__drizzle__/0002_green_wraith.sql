CREATE TABLE `settings` (
	`property` varchar(255) NOT NULL,
	`value` text,
	CONSTRAINT `settings_property` PRIMARY KEY(`property`)
);
