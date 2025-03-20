/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `userCreatedCourse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
ADD COLUMN     "firstName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "userCreatedCourse" DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
