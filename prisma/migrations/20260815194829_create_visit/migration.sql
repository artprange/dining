-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "wouldReturn" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
