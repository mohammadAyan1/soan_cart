-- CreateTable
CREATE TABLE `UserSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(100) NOT NULL,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(100) NULL,
    `deviceId` VARCHAR(150) NOT NULL,
    `platform` VARCHAR(30) NOT NULL,
    `appVersion` VARCHAR(30) NULL,
    `deviceModel` VARCHAR(100) NULL,
    `osVersion` VARCHAR(50) NULL,
    `ipAddress` VARCHAR(50) NULL,
    `userAgent` TEXT NULL,
    `country` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSeen` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,
    `durationSeconds` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `endedBy` ENUM('USER', 'TIMEOUT', 'CRASH', 'FORCE_LOGOUT') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserSession_sessionId_key`(`sessionId`),
    INDEX `UserSession_userId_idx`(`userId`),
    INDEX `UserSession_guestId_idx`(`guestId`),
    INDEX `UserSession_deviceId_idx`(`deviceId`),
    INDEX `UserSession_startedAt_idx`(`startedAt`),
    INDEX `UserSession_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
