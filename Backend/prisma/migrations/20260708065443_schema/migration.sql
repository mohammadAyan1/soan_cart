/*
  Warnings:

  - The values [ADD_TO_CART,REMOVE_FROM_CART,ADD_TO_WISHLIST] on the enum `AnalyticsEvent_eventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropIndex
DROP INDEX `AnalyticsEvent_createdAt_idx` ON `AnalyticsEvent`;

-- AlterTable
ALTER TABLE `AnalyticsEvent` ADD COLUMN `eventAt` DATETIME(3) NULL,
    ADD COLUMN `screen` VARCHAR(50) NULL,
    ADD COLUMN `source` VARCHAR(50) NULL,
    MODIFY `eventType` ENUM('APP_OPEN', 'APP_CLOSE', 'SCREEN_VIEW', 'PRODUCT_IMPRESSION', 'PRODUCT_VIEW', 'PRODUCT_CLICK', 'PRODUCT_SHARE', 'PRODUCT_ADD_TO_WISHLIST', 'PRODUCT_REMOVE_FROM_WISHLIST', 'PRODUCT_ADD_TO_CART', 'PRODUCT_REMOVE_FROM_CART', 'PRODUCT_PURCHASE', 'SEARCH', 'SEARCH_RESULT_CLICK', 'FILTER_APPLIED', 'FILTER_REMOVED', 'CATEGORY_VIEW', 'SUBCATEGORY_VIEW', 'REMOVE_FROM_WISHLIST', 'CHECKOUT_STARTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'ORDER_PLACED', 'LOGIN', 'LOGOUT') NOT NULL;

-- CreateIndex
CREATE INDEX `AnalyticsEvent_screen_idx` ON `AnalyticsEvent`(`screen`);

-- CreateIndex
CREATE INDEX `AnalyticsEvent_source_idx` ON `AnalyticsEvent`(`source`);

-- CreateIndex
CREATE INDEX `AnalyticsEvent_eventAt_idx` ON `AnalyticsEvent`(`eventAt`);
