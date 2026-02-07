CREATE TABLE `promptAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`originalQuestion` text NOT NULL,
	`currentVersionId` int,
	`versionCount` int NOT NULL DEFAULT 1,
	`lastUsedAt` timestamp,
	`lastModifiedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`successStatus` int NOT NULL DEFAULT 0,
	`projectId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promptAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promptVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promptAssetId` int NOT NULL,
	`userId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`generatedPrompt` text NOT NULL,
	`editedPrompt` text,
	`intentAnswers` text,
	`usedLLM` varchar(64),
	`suggestedServices` text,
	`notes` text,
	`successStatus` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promptVersions_id` PRIMARY KEY(`id`)
);
