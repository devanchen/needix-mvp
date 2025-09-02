/*
  Warnings:

  - The values [canceled] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `frequencyDays` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `lastPrice` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `nextDate` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `priceCeiling` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `productUrl` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Item` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrderStatus_new" AS ENUM ('pending', 'held', 'sent');
ALTER TABLE "public"."OrderRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."OrderRequest" ALTER COLUMN "status" TYPE "public"."OrderStatus_new" USING ("status"::text::"public"."OrderStatus_new");
ALTER TYPE "public"."OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "public"."OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "public"."OrderRequest" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- DropIndex
DROP INDEX "public"."Item_userId_idx";

-- AlterTable
ALTER TABLE "public"."Item" DROP COLUMN "frequencyDays",
DROP COLUMN "lastPrice",
DROP COLUMN "nextDate",
DROP COLUMN "priceCeiling",
DROP COLUMN "productUrl",
DROP COLUMN "updatedAt",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "canceled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "intervalDays" INTEGER,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "nextDate" DROP NOT NULL,
ALTER COLUMN "nextDate" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "public"."PriceRule" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "ceiling" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "priceId" TEXT,
    "status" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_key" ON "public"."Membership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_stripeCustomerId_key" ON "public"."Membership"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_stripeSubscriptionId_key" ON "public"."Membership"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "public"."PriceRule" ADD CONSTRAINT "PriceRule_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
