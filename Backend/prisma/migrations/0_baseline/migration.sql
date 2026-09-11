-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NULL,
    `otpExpiry` DATETIME(3) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `role` ENUM('ADMIN', 'USER', 'VENDOR') NOT NULL DEFAULT 'USER',
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `actual_password` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NULL,
    `imageId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_phone_key`(`phone`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(100) NOT NULL,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(100) NULL,
    `deviceId` VARCHAR(150) NOT NULL,
    `platform` ENUM('WEB', 'ANDROID', 'IOS') NOT NULL DEFAULT 'WEB',
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
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,

    UNIQUE INDEX `UserSession_sessionId_key`(`sessionId`),
    INDEX `UserSession_userId_idx`(`userId`),
    INDEX `UserSession_guestId_idx`(`guestId`),
    INDEX `UserSession_deviceId_idx`(`deviceId`),
    INDEX `UserSession_startedAt_idx`(`startedAt`),
    INDEX `UserSession_isActive_idx`(`isActive`),
    INDEX `UserSession_platform_idx`(`platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventType` ENUM('APP_OPEN', 'APP_CLOSE', 'SCREEN_VIEW', 'SCREEN_EXIT', 'PRODUCT_IMPRESSION', 'PRODUCT_VIEW', 'PRODUCT_CLICK', 'PRODUCT_SHARE', 'PRODUCT_ADD_TO_WISHLIST', 'PRODUCT_REMOVE_FROM_WISHLIST', 'PRODUCT_ADD_TO_CART', 'PRODUCT_REMOVE_FROM_CART', 'PRODUCT_PURCHASE', 'SEARCH', 'SEARCH_RESULT_CLICK', 'FILTER_APPLIED', 'FILTER_REMOVED', 'CATEGORY_VIEW', 'SUBCATEGORY_VIEW', 'REMOVE_FROM_WISHLIST', 'SCROLL_STOP', 'CHECKOUT_STARTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'ORDER_PLACED', 'LOGIN', 'LOGOUT', 'SUB_CATEGORY_CLICK', 'CATEGORY_CLICK', 'HANDLE_CHECK_OUT_FROM_DETAILS_PAGE', 'HANDLE_CHECK_OUT_FROM_CART_PAGE', 'REMOVE_PRODUCTS_FROM_CART', 'DECREASE_QUANTITY_OF_PRODUCTS_FROM_CART', 'CLICK_PRODUCTS_FROM_CART', 'INCREASE_QUANTITY_OF_PRODUCTS_FROM_CART', 'PRODUCTS_IMAGE_CLICK', 'PRODUCT_VARIANT_CHANGE', 'PRODUCT_DETAILS_BUY_BTN_CLICK', 'CART_CHECKOUT_BTN_CLICK', 'REMOVE_PRODUCT_FROM_WISHLIST', 'WISHLIST_PRODUCTS_CLICK', 'CLEAR_ALL_WISHLIST') NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `eventAt` DATETIME(3) NULL,
    `screen` VARCHAR(50) NULL,
    `source` VARCHAR(50) NULL,
    `durationSeconds` INTEGER NULL,
    `productId` INTEGER NULL,
    `referrerScreen` VARCHAR(50) NULL,
    `scrollDepth` INTEGER NULL,
    `searchQuery` VARCHAR(255) NULL,
    `variantId` INTEGER NULL,
    `categoryId` INTEGER NULL,
    `subCategoryId` INTEGER NULL,

    INDEX `AnalyticsEvent_eventType_idx`(`eventType`),
    INDEX `AnalyticsEvent_sessionId_idx`(`sessionId`),
    INDEX `AnalyticsEvent_userId_idx`(`userId`),
    INDEX `AnalyticsEvent_screen_idx`(`screen`),
    INDEX `AnalyticsEvent_source_idx`(`source`),
    INDEX `AnalyticsEvent_eventAt_idx`(`eventAt`),
    INDEX `AnalyticsEvent_productId_idx`(`productId`),
    INDEX `AnalyticsEvent_variantId_idx`(`variantId`),
    INDEX `AnalyticsEvent_categoryId_idx`(`categoryId`),
    INDEX `AnalyticsEvent_subCategoryId_idx`(`subCategoryId`),
    INDEX `AnalyticsEvent_userId_eventType_idx`(`userId`, `eventType`),
    INDEX `AnalyticsEvent_sessionId_createdAt_idx`(`sessionId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` TEXT NULL,
    `imageId` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productCategoryName` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `ProductCategory_productCategoryName_key`(`productCategoryName`),
    INDEX `ProductCategory_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSubCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` TEXT NULL,
    `imageId` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `categoryId` INTEGER NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productSubCategoryName` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `ProductSubCategory_userId_fkey`(`userId`),
    UNIQUE INDEX `ProductSubCategory_categoryId_productSubCategoryName_key`(`categoryId`, `productSubCategoryName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `categoryId` INTEGER NULL,
    `subCategoryId` INTEGER NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `imageId` VARCHAR(191) NULL,
    `imageUrl` TEXT NULL,
    `isApprove` BOOLEAN NOT NULL DEFAULT false,
    `tags` JSON NULL,
    `categoryRemark` TEXT NULL,
    `subCategoryRemark` TEXT NULL,

    INDEX `Product_categoryId_fkey`(`categoryId`),
    INDEX `Product_subCategoryId_fkey`(`subCategoryId`),
    INDEX `Product_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NULL,
    `actualPrice` DECIMAL(10, 2) NOT NULL,
    `mrp` DECIMAL(10, 2) NOT NULL,
    `showMrp` BOOLEAN NOT NULL DEFAULT true,
    `vendorMinPrice` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `tags` JSON NULL,
    `attributes` JSON NULL,
    `productId` INTEGER NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ProductVariant_productId_fkey`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` TEXT NULL,
    `imageId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `productVariantId` INTEGER NOT NULL,

    INDEX `ProductImage_productVariantId_fkey`(`productVariantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Cart_userId_key`(`userId`),
    UNIQUE INDEX `Cart_guestId_key`(`guestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `convertedAt` DATETIME(3) NULL,
    `convertedDeviceId` VARCHAR(191) NULL,
    `convertedSessionId` VARCHAR(191) NULL,
    `convertedUserId` INTEGER NULL,
    `firstAddedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `originalGuestId` VARCHAR(191) NULL,
    `originallyAddedBy` ENUM('GUEST', 'USER') NOT NULL DEFAULT 'USER',
    `totalQuantityChanges` INTEGER NOT NULL DEFAULT 0,
    `totalReAddCount` INTEGER NOT NULL DEFAULT 0,
    `totalRemoveCount` INTEGER NOT NULL DEFAULT 0,

    INDEX `CartItem_productId_fkey`(`productId`),
    INDEX `CartItem_variantId_fkey`(`variantId`),
    UNIQUE INDEX `CartItem_cartId_variantId_key`(`cartId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `paymentStatus` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `orderType` ENUM('ONLINE', 'COD') NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `addressLine` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `orderSource` ENUM('DIRECT', 'CART') NOT NULL DEFAULT 'DIRECT',
    `sourceScreen` VARCHAR(50) NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `vendorId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `deliveryStatus` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_ACCEPTED', 'RETURN_REJECTED', 'RETURNED') NOT NULL DEFAULT 'PENDING',
    `expectedDeliveryDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fromWishlist` BOOLEAN NOT NULL DEFAULT false,

    INDEX `OrderItem_orderId_fkey`(`orderId`),
    INDEX `OrderItem_productId_fkey`(`productId`),
    INDEX `OrderItem_variantId_fkey`(`variantId`),
    INDEX `OrderItem_vendorId_fkey`(`vendorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItemStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURN_ACCEPTED', 'RETURN_REJECTED', 'RETURNED') NOT NULL,
    `note` TEXT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderItemStatusHistory_orderItemId_fkey`(`orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wishlist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `guestId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wishlist_userId_key`(`userId`),
    UNIQUE INDEX `Wishlist_guestId_key`(`guestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WishlistItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wishlistId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `vendorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `convertedAt` DATETIME(3) NULL,
    `convertedUserId` INTEGER NULL,
    `firstAddedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `originalGuestId` VARCHAR(191) NULL,
    `originallyAddedBy` ENUM('GUEST', 'USER') NOT NULL DEFAULT 'USER',

    INDEX `WishlistItem_productId_fkey`(`productId`),
    INDEX `WishlistItem_variantId_fkey`(`variantId`),
    INDEX `WishlistItem_vendorId_fkey`(`vendorId`),
    UNIQUE INDEX `WishlistItem_wishlistId_variantId_key`(`wishlistId`, `variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `addressLine` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Address_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `orderItemId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_orderItemId_key`(`orderItemId`),
    INDEX `Review_productId_idx`(`productId`),
    INDEX `Review_variantId_idx`(`variantId`),
    INDEX `Review_userId_idx`(`userId`),
    INDEX `Review_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `imageUrl` TEXT NULL,
    `imageId` VARCHAR(191) NULL,
    `reviewId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReviewImage_reviewId_fkey`(`reviewId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `eventType` ENUM('ADD_TO_WISHLIST', 'REMOVE_FROM_WISHLIST', 'MOVE_TO_CART', 'RESTORE_TO_WISHLIST', 'CLEAR_WISHLIST', 'MERGED_FROM_GUEST', 'MERGED_TO_USER', 'AUTO_REMOVE_PRODUCT', 'AUTO_REMOVE_VARIANT', 'ORDER_CREATED') NOT NULL,
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
    `addedFromScreen` VARCHAR(50) NULL,
    `wasInWishlist` BOOLEAN NOT NULL DEFAULT false,

    INDEX `PurchaseJourney_orderId_idx`(`orderId`),
    INDEX `PurchaseJourney_userId_idx`(`userId`),
    INDEX `PurchaseJourney_guestId_idx`(`guestId`),
    INDEX `PurchaseJourney_productId_idx`(`productId`),
    INDEX `PurchaseJourney_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `UserSession`(`sessionId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalyticsEvent` ADD CONSTRAINT `AnalyticsEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubCategory` ADD CONSTRAINT `ProductSubCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubCategory` ADD CONSTRAINT `ProductSubCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `ProductSubCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItemStatusHistory` ADD CONSTRAINT `OrderItemStatusHistory_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistItem` ADD CONSTRAINT `WishlistItem_wishlistId_fkey` FOREIGN KEY (`wishlistId`) REFERENCES `Wishlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewImage` ADD CONSTRAINT `ReviewImage_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartActivity` ADD CONSTRAINT `CartActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishlistActivity` ADD CONSTRAINT `WishlistActivity_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestConversion` ADD CONSTRAINT `GuestConversion_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseJourney` ADD CONSTRAINT `PurchaseJourney_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

