-- CreateTable
CREATE TABLE "Dungeon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "mapData" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 60,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
