/*
  Warnings:

  - You are about to alter the column `platform` on the `usersession` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `AnalyticsEvent` ADD COLUMN `durationSeconds` INTEGER NULL,
    ADD COLUMN `productId` INTEGER NULL,
    ADD COLUMN `referrerScreen` VARCHAR(50) NULL,
    ADD COLUMN `scrollDepth` INTEGER NULL,
    ADD COLUMN `searchQuery` VARCHAR(255) NULL,
    ADD COLUMN `variantId` INTEGER NULL,
    MODIFY `eventType` ENUM('APP_OPEN', 'APP_CLOSE', 'SCREEN_VIEW', 'SCREEN_EXIT', 'PRODUCT_IMPRESSION', 'PRODUCT_VIEW', 'PRODUCT_CLICK', 'PRODUCT_SHARE', 'PRODUCT_ADD_TO_WISHLIST', 'PRODUCT_REMOVE_FROM_WISHLIST', 'PRODUCT_ADD_TO_CART', 'PRODUCT_REMOVE_FROM_CART', 'PRODUCT_PURCHASE', 'SEARCH', 'SEARCH_RESULT_CLICK', 'FILTER_APPLIED', 'FILTER_REMOVED', 'CATEGORY_VIEW', 'SUBCATEGORY_VIEW', 'REMOVE_FROM_WISHLIST', 'SCROLL_STOP', 'CHECKOUT_STARTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'ORDER_PLACED', 'LOGIN', 'LOGOUT') NOT NULL,
    MODIFY `payload` JSON NULL;

-- AlterTable
ALTER TABLE `UserSession` ADD COLUMN `latitude` DECIMAL(10, 7) NULL,
    ADD COLUMN `longitude` DECIMAL(10, 7) NULL,
    MODIFY `platform` ENUM('WEB', 'ANDROID', 'IOS') NOT NULL DEFAULT 'WEB';

-- CreateIndex
CREATE INDEX `AnalyticsEvent_productId_idx` ON `AnalyticsEvent`(`productId`);

-- CreateIndex
CREATE INDEX `AnalyticsEvent_variantId_idx` ON `AnalyticsEvent`(`variantId`);

-- CreateIndex
CREATE INDEX `AnalyticsEvent_userId_eventType_idx` ON `AnalyticsEvent`(`userId`, `eventType`);

-- CreateIndex
CREATE INDEX `AnalyticsEvent_sessionId_createdAt_idx` ON `AnalyticsEvent`(`sessionId`, `createdAt`);

-- CreateIndex
CREATE INDEX `UserSession_platform_idx` ON `UserSession`(`platform`);
