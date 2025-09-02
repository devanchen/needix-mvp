/*
  Warnings:

  - A unique constraint covering the columns `[createdFromDetectionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Cadence" AS ENUM ('weekly', 'monthly', 'yearly', 'unknown');

-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "createdFromDetectionId" TEXT;

-- CreateTable
CREATE TABLE "public"."Merchant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],
    "website" TEXT,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Detection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rawId" TEXT,
    "merchantId" TEXT,
    "merchantRaw" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "currency" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "cadence" "public"."Cadence",
    "confidence" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "resolvedToSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Detection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionSuggestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "detectionId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "plan" TEXT,
    "price" DECIMAL(10,2),
    "nextDate" TIMESTAMP(3),
    "manageUrl" TEXT,
    "confidence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_name_key" ON "public"."Merchant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Detection_resolvedToSubscriptionId_key" ON "public"."Detection"("resolvedToSubscriptionId");

-- CreateIndex
CREATE INDEX "Detection_userId_idx" ON "public"."Detection"("userId");

-- CreateIndex
CREATE INDEX "Detection_userId_occurredAt_idx" ON "public"."Detection"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "Detection_merchantId_idx" ON "public"."Detection"("merchantId");

-- CreateIndex
CREATE INDEX "Detection_confidence_idx" ON "public"."Detection"("confidence");

-- CreateIndex
CREATE INDEX "Detection_source_rawId_idx" ON "public"."Detection"("source", "rawId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionSuggestion_detectionId_key" ON "public"."SubscriptionSuggestion"("detectionId");

-- CreateIndex
CREATE INDEX "SubscriptionSuggestion_userId_confidence_idx" ON "public"."SubscriptionSuggestion"("userId", "confidence");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_createdFromDetectionId_key" ON "public"."Subscription"("createdFromDetectionId");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_createdFromDetectionId_fkey" FOREIGN KEY ("createdFromDetectionId") REFERENCES "public"."Detection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Detection" ADD CONSTRAINT "Detection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Detection" ADD CONSTRAINT "Detection_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "public"."Merchant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Detection" ADD CONSTRAINT "Detection_resolvedToSubscriptionId_fkey" FOREIGN KEY ("resolvedToSubscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionSuggestion" ADD CONSTRAINT "SubscriptionSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionSuggestion" ADD CONSTRAINT "SubscriptionSuggestion_detectionId_fkey" FOREIGN KEY ("detectionId") REFERENCES "public"."Detection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
