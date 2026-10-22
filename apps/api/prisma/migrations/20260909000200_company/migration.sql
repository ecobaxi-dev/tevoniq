CREATE TABLE "CompanyPage" (
  "slug" TEXT NOT NULL,
  "locale" "Locale" NOT NULL,
  "content" JSONB NOT NULL,
  "published" BOOLEAN NOT NULL DEFAULT false,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyPage_pkey" PRIMARY KEY ("slug", "locale")
);
