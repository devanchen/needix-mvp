-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Denver',
ADD COLUMN     "wantsEmailReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "wantsSmsReminders" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "public"."Item"("userId");

-- CreateIndex
CREATE INDEX "Membership_status_idx" ON "public"."Membership"("status");

-- CreateIndex
CREATE INDEX "OrderRequest_itemId_idx" ON "public"."OrderRequest"("itemId");

-- CreateIndex
CREATE INDEX "PriceRule_itemId_idx" ON "public"."PriceRule"("itemId");

-- CreateIndex
CREATE INDEX "Subscription_userId_nextDate_idx" ON "public"."Subscription"("userId", "nextDate");

-- CreateIndex
CREATE INDEX "Subscription_canceled_nextDate_idx" ON "public"."Subscription"("canceled", "nextDate");
