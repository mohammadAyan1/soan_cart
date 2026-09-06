-- AlterTable
ALTER TABLE `product` ADD COLUMN `isApprove` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tags` JSON NULL;
