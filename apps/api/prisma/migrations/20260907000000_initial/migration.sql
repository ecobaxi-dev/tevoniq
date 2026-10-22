CREATE SCHEMA IF NOT EXISTS "public";
CREATE TYPE "Locale" AS ENUM ('en', 'tr', 'ar');
CREATE TABLE "DevelopmentFixture" (
 "id" TEXT NOT NULL,
 "label" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "DevelopmentFixture_pkey" PRIMARY KEY ("id")
);
