/*
  Warnings:

  - You are about to drop the column `VendorAllow` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `allowVendorToSee` INTEGER NULL;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `VendorAllow`;
