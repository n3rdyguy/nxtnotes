/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `session` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `account` DROP COLUMN `expiresAt`,
    ADD COLUMN `accessTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `refreshTokenExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `scope` TEXT NULL,
    MODIFY `accountId` TEXT NOT NULL,
    MODIFY `providerId` TEXT NOT NULL,
    MODIFY `password` TEXT NULL;

-- AlterTable
ALTER TABLE `session` ADD COLUMN `token` VARCHAR(191) NOT NULL,
    MODIFY `ipAddress` TEXT NULL,
    MODIFY `userAgent` TEXT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `image` TEXT NULL,
    MODIFY `name` TEXT NOT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `verification` MODIFY `identifier` TEXT NOT NULL,
    MODIFY `value` TEXT NOT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `session_token_key` ON `session`(`token`);
