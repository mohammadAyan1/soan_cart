-- CreateTable
CREATE TABLE `orderItemVendorChange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `userSelectVendor` INTEGER NOT NULL,
    `AdminSelectedVendor` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `orderItemVendorChange_orderItemId_fkey`(`orderItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orderItemVendorChange` ADD CONSTRAINT `orderItemVendorChange_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItemVendorChange` ADD CONSTRAINT `orderItemVendorChange_userSelectVendor_fkey` FOREIGN KEY (`userSelectVendor`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderItemVendorChange` ADD CONSTRAINT `orderItemVendorChange_AdminSelectedVendor_fkey` FOREIGN KEY (`AdminSelectedVendor`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
