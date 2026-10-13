-- CreateTable
CREATE TABLE `Unit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Unit_name_key`(`name`),
    UNIQUE INDEX `Unit_shortName_key`(`shortName`),
    INDEX `Unit_isDelete_idx`(`isDelete`),
    INDEX `Unit_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VegetableProduct` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productName` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `subCategoryId` INTEGER NOT NULL,
    `unitId` INTEGER NOT NULL,
    `imageUrl` TEXT NULL,
    `imageId` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `isDelete` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VegetableProduct_categoryId_idx`(`categoryId`),
    INDEX `VegetableProduct_subCategoryId_idx`(`subCategoryId`),
    INDEX `VegetableProduct_unitId_idx`(`unitId`),
    INDEX `VegetableProduct_isDelete_idx`(`isDelete`),
    INDEX `VegetableProduct_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VegetableProduct` ADD CONSTRAINT `VegetableProduct_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ProductCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VegetableProduct` ADD CONSTRAINT `VegetableProduct_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `ProductSubCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VegetableProduct` ADD CONSTRAINT `VegetableProduct_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
