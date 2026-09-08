/*
  Warnings:

  - Added the required column `image_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `imageUrl` TEXT NULL,
    ADD COLUMN `image_id` VARCHAR(191) NOT NULL;
