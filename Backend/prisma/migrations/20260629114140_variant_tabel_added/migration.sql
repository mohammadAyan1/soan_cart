/*
  Warnings:

  - You are about to drop the column `actualPrice` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `mrp` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `showMrp` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `vendorMinPrice` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `productVariantId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductImage` DROP FOREIGN KEY `ProductImage_productId_fkey`;

-- DropIndex
DROP INDEX `ProductImage_productId_fkey` ON `ProductImage`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `actualPrice`,
    DROP COLUMN `mrp`,
    DROP COLUMN `showMrp`,
    DROP COLUMN `stock`,
    DROP COLUMN `tags`,
    DROP COLUMN `vendorMinPrice`,
    ADD COLUMN `imageId` VARCHAR(191) NULL,
    ADD COLUMN `imageUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `ProductImage` DROP COLUMN `productId`,
    ADD COLUMN `productVariantId` INTEGER NOT NULL,
    MODIFY `imageUrl` TEXT NULL;

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

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `ProductVariant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
