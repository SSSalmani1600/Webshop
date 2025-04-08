CREATE TABLE `session` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `userId` int NOT NULL,  -- Removed (11)
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
