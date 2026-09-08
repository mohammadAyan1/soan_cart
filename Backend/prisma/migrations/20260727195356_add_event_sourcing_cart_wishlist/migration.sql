-- AlterTable
ALTER TABLE `CartItem` ADD COLUMN `convertedAt` DATETIME(3) NULL,
    ADD COLUMN `convertedDeviceId` VARCHAR(191) NULL,
    ADD COLUMN `convertedSessionId` VARCHAR(191) NULL,
    ADD COLUMN `convertedUserId` INTEGER NULL,
    ADD COLUMN `firstAddedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `originalGuestId` VARCHAR(191) NULL,
    ADD COLUMN `originallyAddedBy` ENUM('GUEST', 'USER') NOT NULL DEFAULT 'USER',
    ADD COLUMN `totalQuantityChanges` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalReAddCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalRemoveCount` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `CartActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventType` ENUM('ADD_TO_CART', 'REMOVE_FROM_CART', 'UPDATE_QUANTITY', 'INCREASE_QUANTITY', 'DECREASE_QUANTITY', 'CLEAR_CART', 'RESTORE_TO_CART', 'PURCHASED', 'CHECKOUT_STARTED', 'CHECKOUT_FAILED', 'ORDER_CREATED', 'MERGED_FROM_GUEST', 'MERGED_TO_USER', 'AUTO_REMOVE_OUT_OF_STOCK', 'AUTO_REMOVE_PRODUCT_DELETED', 'AUTO_REMOVE_VARIANT_DELETED', 'MOVE_TO_WISHLIST', 'RESTORE_FROM_WISHLIST') NOT NULL,
    `actorType` ENUM('GUEST', 'USER') NOT NULL,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(191) NULL,
    `cartId` INTEGER NOT NULL,
    `cartItemId` INTEGER NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `previousQuantity` INTEGER NULL,
    `newQuantity` INTEGER NULL,
    `previousState` JSON NULL,
    `currentState` JSON NULL,
    `productSnapshot` JSON NOT NULL,
    `reason` ENUM('USER_ACTION', 'CLEAR_ACTION', 'CHECKOUT', 'PRODUCT_DELETED', 'VARIANT_DELETED', 'OUT_OF_STOCK', 'ADMIN_ACTION', 'GUEST_MERGE', 'USER_MERGE', 'MOVED_TO_OTHER_LIST', 'SYSTEM_AUTO') NULL,
    `reasonNote` TEXT NULL,
    `sessionId` VARCHAR(191) NULL,
    `deviceId` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `sourceScreen` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CartActivity_userId_idx`(`userId`),
    INDEX `CartActivity_guestId_idx`(`guestId`),
    INDEX `CartActivity_cartId_idx`(`cartId`),
    INDEX `CartActivity_cartItemId_idx`(`cartItemId`),
    INDEX `CartActivity_productId_idx`(`productId`),
    INDEX `CartActivity_variantId_idx`(`variantId`),
    INDEX `CartActivity_eventType_idx`(`eventType`),
    INDEX `CartActivity_sessionId_idx`(`sessionId`),
    INDEX `CartActivity_createdAt_idx`(`createdAt`),
    INDEX `CartActivity_userId_eventType_idx`(`userId`, `eventType`),
    INDEX `CartActivity_productId_eventType_idx`(`productId`, `eventType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WishlistActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventType` ENUM('ADD_TO_WISHLIST', 'REMOVE_FROM_WISHLIST', 'MOVE_TO_CART', 'RESTORE_TO_WISHLIST', 'CLEAR_WISHLIST', 'MERGED_FROM_GUEST', 'MERGED_TO_USER', 'AUTO_REMOVE_PRODUCT', 'AUTO_REMOVE_VARIANT') NOT NULL,
    `actorType` ENUM('GUEST', 'USER') NOT NULL,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(191) NULL,
    `wishlistId` INTEGER NOT NULL,
    `wishlistItemId` INTEGER NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `previousState` JSON NULL,
    `currentState` JSON NULL,
    `productSnapshot` JSON NOT NULL,
    `reason` ENUM('USER_ACTION', 'CLEAR_ACTION', 'CHECKOUT', 'PRODUCT_DELETED', 'VARIANT_DELETED', 'OUT_OF_STOCK', 'ADMIN_ACTION', 'GUEST_MERGE', 'USER_MERGE', 'MOVED_TO_OTHER_LIST', 'SYSTEM_AUTO') NULL,
    `reasonNote` TEXT NULL,
    `sessionId` VARCHAR(191) NULL,
    `deviceId` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `sourceScreen` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WishlistActivity_userId_idx`(`userId`),
    INDEX `WishlistActivity_guestId_idx`(`guestId`),
    INDEX `WishlistActivity_wishlistId_idx`(`wishlistId`),
    INDEX `WishlistActivity_wishlistItemId_idx`(`wishlistItemId`),
    INDEX `WishlistActivity_productId_idx`(`productId`),
    INDEX `WishlistActivity_variantId_idx`(`variantId`),
    INDEX `WishlistActivity_eventType_idx`(`eventType`),
    INDEX `WishlistActivity_sessionId_idx`(`sessionId`),
    INDEX `WishlistActivity_createdAt_idx`(`createdAt`),
    INDEX `WishlistActivity_userId_eventType_idx`(`userId`, `eventType`),
    INDEX `WishlistActivity_productId_eventType_idx`(`productId`, `eventType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestConversion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guestId` VARCHAR(191) NOT NULL,
    `guestCartId` INTEGER NULL,
    `guestWishlistId` INTEGER NULL,
    `userId` INTEGER NOT NULL,
    `userCartId` INTEGER NULL,
    `userWishlistId` INTEGER NULL,
    `triggerType` ENUM('AUTO', 'MANUAL') NOT NULL DEFAULT 'AUTO',
    `mergeReason` TEXT NULL,
    `cartItemsMergedCount` INTEGER NOT NULL DEFAULT 0,
    `cartItemsSkippedCount` INTEGER NOT NULL DEFAULT 0,
    `wishlistItemsMergedCount` INTEGER NOT NULL DEFAULT 0,
    `wishlistItemsSkippedCount` INTEGER NOT NULL DEFAULT 0,
    `sessionId` VARCHAR(191) NULL,
    `deviceId` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `mergedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `GuestConversion_guestId_idx`(`guestId`),
    INDEX `GuestConversion_userId_idx`(`userId`),
    INDEX `GuestConversion_mergedAt_idx`(`mergedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseJourney` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `orderItemId` INTEGER NOT NULL,
    `originCartActivityId` INTEGER NULL,
    `cartId` INTEGER NULL,
    `cartItemId` INTEGER NULL,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(191) NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `purchasedQuantity` INTEGER NOT NULL,
    `purchasedPrice` DECIMAL(10, 2) NOT NULL,
    `couponCode` VARCHAR(191) NULL,
    `discountAmount` DECIMAL(10, 2) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `orderTimestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PurchaseJourney_orderId_idx`(`orderId`),
    INDEX `PurchaseJourney_userId_idx`(`userId`),
    INDEX `PurchaseJourney_guestId_idx`(`guestId`),
    INDEX `PurchaseJourney_productId_idx`(`productId`),
    INDEX `PurchaseJourney_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CartActivity` ADD CONSTRAINT `CartActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistActivity` ADD CONSTRAINT `WishlistActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestConversion` ADD CONSTRAINT `GuestConversion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseJourney` ADD CONSTRAINT `PurchaseJourney_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
