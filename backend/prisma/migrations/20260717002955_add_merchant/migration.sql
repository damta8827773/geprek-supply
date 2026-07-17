-- CreateTable
CREATE TABLE "Merchant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ownerName" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kota" TEXT,
    "kabupaten" TEXT,
    "kodePos" TEXT,
    "phone" TEXT,
    "landmark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_shopName_key" ON "Merchant"("shopName");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");
