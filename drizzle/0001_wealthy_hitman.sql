CREATE TABLE `newsletterSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`language` varchar(10) DEFAULT 'TR',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletterSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletterSubscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`totalPrice` decimal(12,2) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
	`shippingAddress` text,
	`shippingCountry` varchar(100),
	`trackingNumber` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nameTR` varchar(255) NOT NULL,
	`nameEN` varchar(255) NOT NULL,
	`nameAR` varchar(255) NOT NULL,
	`descriptionTR` text,
	`descriptionEN` text,
	`descriptionAR` text,
	`price` decimal(10,2) NOT NULL,
	`collection` varchar(100) NOT NULL,
	`imageUrl` varchar(500),
	`stock` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlist_id` PRIMARY KEY(`id`)
);
