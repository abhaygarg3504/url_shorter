-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shorter" (
    "id" TEXT NOT NULL,
    "fullUrl" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,

    CONSTRAINT "Shorter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shorter_shortUrl_key" ON "Shorter"("shortUrl");

-- CreateIndex
CREATE INDEX "Shorter_shortUrl_idx" ON "Shorter"("shortUrl");

-- AddForeignKey
ALTER TABLE "Shorter" ADD CONSTRAINT "Shorter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
