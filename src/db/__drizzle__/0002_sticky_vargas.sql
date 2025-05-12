CREATE TABLE `presigned_image_url` (
	`file_name` varchar(255) NOT NULL,
	`presigned_url` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `presigned_image_url_file_name` PRIMARY KEY(`file_name`)
);
