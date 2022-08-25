/*
  Warnings:

  - The primary key for the `Follows` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `followerId` on the `Follows` table. All the data in the column will be lost.
  - You are about to drop the column `followingId` on the `Follows` table. All the data in the column will be lost.
  - Added the required column `followerName` to the `Follows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingName` to the `Follows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_followingId_fkey";

-- DropIndex
DROP INDEX "Follows_followerId_followingId_idx";

-- AlterTable
ALTER TABLE "Follows" DROP CONSTRAINT "Follows_pkey",
DROP COLUMN "followerId",
DROP COLUMN "followingId",
ADD COLUMN     "followerName" TEXT NOT NULL,
ADD COLUMN     "followingName" TEXT NOT NULL,
ADD CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerName", "followingName");

-- CreateIndex
CREATE INDEX "Follows_followerName_followingName_idx" ON "Follows"("followerName", "followingName");

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerName_fkey" FOREIGN KEY ("followerName") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingName_fkey" FOREIGN KEY ("followingName") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
