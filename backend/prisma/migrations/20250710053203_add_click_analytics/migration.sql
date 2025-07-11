-- CreateTable
CREATE TABLE "ClickAnalytics" (
    "id" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "deviceType" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "referrer" TEXT,
    "referrerType" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,

    CONSTRAINT "ClickAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickAnalytics_shortUrl_idx" ON "ClickAnalytics"("shortUrl");

-- CreateIndex
CREATE INDEX "ClickAnalytics_timestamp_idx" ON "ClickAnalytics"("timestamp");

-- CreateIndex
CREATE INDEX "ClickAnalytics_country_idx" ON "ClickAnalytics"("country");

-- CreateIndex
CREATE INDEX "ClickAnalytics_referrerType_idx" ON "ClickAnalytics"("referrerType");

-- AddForeignKey
ALTER TABLE "ClickAnalytics" ADD CONSTRAINT "ClickAnalytics_shortUrl_fkey" FOREIGN KEY ("shortUrl") REFERENCES "Shorter"("shortUrl") ON DELETE RESTRICT ON UPDATE CASCADE;
