/*
  Warnings:

  - You are about to drop the column `product_category_name` on the `productcategory` table. All the data in the column will be lost.
  - You are about to drop the column `product_subcategory_name` on the `productsubcategory` table. All the data in the column will be lost.
  - You are about to drop the column `image_id` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productCategoryName]` on the table `ProductCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryId,productSubCategoryName]` on the table `ProductSubCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productCategoryName` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ProductCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSubCategoryName` to the `ProductSubCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ProductSubCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ProductCategory_product_category_name_key` ON `productcategory`;

-- DropIndex
DROP INDEX `ProductSubCategory_product_subcategory_name_key` ON `productsubcategory`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `productcategory` DROP COLUMN `product_category_name`,
    ADD COLUMN `productCategoryName` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `productimage` ADD COLUMN `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `imageId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `productsubcategory` DROP COLUMN `product_subcategory_name`,
    ADD COLUMN `productSubCategoryName` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `image_id`,
    ADD COLUMN `imageId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ProductCategory_productCategoryName_key` ON `ProductCategory`(`productCategoryName`);

-- CreateIndex
CREATE UNIQUE INDEX `ProductSubCategory_categoryId_productSubCategoryName_key` ON `ProductSubCategory`(`categoryId`, `productSubCategoryName`);

-- AddForeignKey
ALTER TABLE `ProductCategory` ADD CONSTRAINT `ProductCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductSubCategory` ADD CONSTRAINT `ProductSubCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
