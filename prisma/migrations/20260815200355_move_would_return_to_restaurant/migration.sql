/*
  Warnings:

  - You are about to drop the column `wouldReturn` on the `Visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "wouldReturn" BOOLEAN;

-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "wouldReturn";
