CREATE TABLE `intentTemplate` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(128) NOT NULL,
	`keywords` text,
	`questions` text NOT NULL,
	`defaultAnswers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `intentTemplate_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promptHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`originalQuestion` text NOT NULL,
	`intentAnswers` text,
	`generatedPrompt` text NOT NULL,
	`editedPrompt` text,
	`usedLLM` varchar(64),
	`suggestedServices` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promptHistory_id` PRIMARY KEY(`id`)
);
