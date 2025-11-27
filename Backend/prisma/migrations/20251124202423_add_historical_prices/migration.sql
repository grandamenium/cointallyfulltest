-- CreateTable
CREATE TABLE "historical_prices" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "priceUsd" DECIMAL(15,8) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'coingecko',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historical_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historical_prices_asset_idx" ON "historical_prices"("asset");

-- CreateIndex
CREATE UNIQUE INDEX "historical_prices_asset_date_key" ON "historical_prices"("asset", "date");
