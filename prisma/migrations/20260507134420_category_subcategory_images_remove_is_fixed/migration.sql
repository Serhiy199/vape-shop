/*
  Warnings:

  - You are about to drop the column `isFixed` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "isFixed",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Subcategory" ADD COLUMN     "image" TEXT;
