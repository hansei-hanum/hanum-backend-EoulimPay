-- CreateTable
CREATE TABLE `EoullimUser` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EoullimBalances` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NULL,
    `boothId` BIGINT NULL,
    `amount` BIGINT NOT NULL DEFAULT 0,
    `type` ENUM('personal', 'booth') NOT NULL DEFAULT 'personal',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EoullimBooths` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `class` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EoullimBooths_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EoullimPayments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `boothId` BIGINT NOT NULL,
    `userBalanceId` BIGINT NOT NULL,
    `boothBalanceId` BIGINT NOT NULL,
    `paidAmount` BIGINT NOT NULL,
    `refundedAmount` BIGINT NULL,
    `paymentsTransactionId` BIGINT NOT NULL,
    `refundTransactionId` BIGINT NULL,
    `paymentComment` VARCHAR(191) NOT NULL,
    `refundComment` VARCHAR(191) NOT NULL,
    `status` ENUM('paid', 'refunded', 'failed') NOT NULL,
    `refundedTime` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EoullimTransactions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `senderId` BIGINT NULL,
    `reciverId` BIGINT NOT NULL,
    `amount` BIGINT NOT NULL,
    `comment` VARCHAR(191) NOT NULL,
    `time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EoullimPayments` ADD CONSTRAINT `EoullimPayments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `EoullimUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EoullimPayments` ADD CONSTRAINT `EoullimPayments_boothId_fkey` FOREIGN KEY (`boothId`) REFERENCES `EoullimBooths`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
