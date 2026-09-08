-- AlterTable
ALTER TABLE `AnalyticsEvent` ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `subCategoryId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `AnalyticsEvent_categoryId_idx` ON `AnalyticsEvent`(`categoryId`);

-- CreateIndex
CREATE INDEX `AnalyticsEvent_subCategoryId_idx` ON `AnalyticsEvent`(`subCategoryId`);
