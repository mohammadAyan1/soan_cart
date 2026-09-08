/*
  Warnings:

  - Added the required column `actual_password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `actual_password` VARCHAR(191) NOT NULL;