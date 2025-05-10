CREATE TABLE `menu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`label` text NOT NULL,
	`path` text NOT NULL,
	`category` text,
	CONSTRAINT `menu_id` PRIMARY KEY(`id`)
);
