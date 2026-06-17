-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "price" INTEGER NOT NULL,
    "icon" TEXT NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "regionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Supplier" ("createdAt", "icon", "id", "inStock", "lat", "lng", "material", "name", "price", "regionId", "updatedAt") SELECT "createdAt", "icon", "id", "inStock", "lat", "lng", "material", "name", "price", "regionId", "updatedAt" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE INDEX "Supplier_regionId_idx" ON "Supplier"("regionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
