/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userName_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" VARCHAR(255) NOT NULL DEFAULT 'Hello World!';

-- DropTable
DROP TABLE "Profile";
