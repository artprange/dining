-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('CHEAP', 'MODERATE', 'EXPENSIVE', 'FINE_DINING');

-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WishlistPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "priceRange" "PriceRange",
ADD COLUMN     "status" "RestaurantStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "wishlistPriority" "WishlistPriority" NOT NULL DEFAULT 'NORMAL';

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CuisineTypeToRestaurant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CuisineTypeToRestaurant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RestaurantToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RestaurantToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_CuisineTypeToRestaurant_B_index" ON "_CuisineTypeToRestaurant"("B");

-- CreateIndex
CREATE INDEX "_RestaurantToTag_B_index" ON "_RestaurantToTag"("B");

-- AddForeignKey
ALTER TABLE "_CuisineTypeToRestaurant" ADD CONSTRAINT "_CuisineTypeToRestaurant_A_fkey" FOREIGN KEY ("A") REFERENCES "CuisineType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CuisineTypeToRestaurant" ADD CONSTRAINT "_CuisineTypeToRestaurant_B_fkey" FOREIGN KEY ("B") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RestaurantToTag" ADD CONSTRAINT "_RestaurantToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RestaurantToTag" ADD CONSTRAINT "_RestaurantToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: carrega o vinculo 1:N existente para a tabela de juncao antes de dropar a coluna.
INSERT INTO "_CuisineTypeToRestaurant" ("A", "B")
SELECT "cuisineTypeId", "id" FROM "Restaurant" WHERE "cuisineTypeId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_cuisineTypeId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "cuisineTypeId";

-- CreateIndex
CREATE INDEX "Restaurant_status_idx" ON "Restaurant"("status");

-- CreateIndex
CREATE INDEX "Restaurant_city_neighborhood_idx" ON "Restaurant"("city", "neighborhood");

-- CreateIndex
CREATE INDEX "Visit_restaurantId_visitedAt_idx" ON "Visit"("restaurantId", "visitedAt");
