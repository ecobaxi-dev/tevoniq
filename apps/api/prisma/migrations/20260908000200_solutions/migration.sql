-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "SolutionStatus" NOT NULL DEFAULT 'DRAFT',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolutionTranslation" (
    "id" TEXT NOT NULL,
    "solutionId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolutionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolutionService" (
    "solutionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SolutionService_pkey" PRIMARY KEY ("solutionId","serviceId")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryTranslation" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndustryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolutionIndustry" (
    "solutionId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SolutionIndustry_pkey" PRIMARY KEY ("solutionId","industryId")
);

-- CreateTable
CREATE TABLE "SolutionProject" (
    "solutionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SolutionProject_pkey" PRIMARY KEY ("solutionId","projectId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solution_slug_key" ON "Solution"("slug");

-- CreateIndex
CREATE INDEX "Solution_active_published_status_featured_sortOrder_slug_idx" ON "Solution"("active", "published", "status", "featured", "sortOrder", "slug");

-- CreateIndex
CREATE INDEX "Solution_createdById_idx" ON "Solution"("createdById");

-- CreateIndex
CREATE INDEX "Solution_updatedById_idx" ON "Solution"("updatedById");

-- CreateIndex
CREATE INDEX "SolutionTranslation_locale_published_idx" ON "SolutionTranslation"("locale", "published");

-- CreateIndex
CREATE UNIQUE INDEX "SolutionTranslation_solutionId_locale_key" ON "SolutionTranslation"("solutionId", "locale");

-- CreateIndex
CREATE INDEX "SolutionService_serviceId_idx" ON "SolutionService"("serviceId");

-- CreateIndex
CREATE INDEX "SolutionService_solutionId_sortOrder_idx" ON "SolutionService"("solutionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_slug_key" ON "Industry"("slug");

-- CreateIndex
CREATE INDEX "IndustryTranslation_locale_published_idx" ON "IndustryTranslation"("locale", "published");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryTranslation_industryId_locale_key" ON "IndustryTranslation"("industryId", "locale");

-- CreateIndex
CREATE INDEX "SolutionIndustry_industryId_idx" ON "SolutionIndustry"("industryId");

-- CreateIndex
CREATE INDEX "SolutionIndustry_solutionId_sortOrder_idx" ON "SolutionIndustry"("solutionId", "sortOrder");

-- CreateIndex
CREATE INDEX "SolutionProject_projectId_idx" ON "SolutionProject"("projectId");

-- CreateIndex
CREATE INDEX "SolutionProject_solutionId_sortOrder_idx" ON "SolutionProject"("solutionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionTranslation" ADD CONSTRAINT "SolutionTranslation_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionService" ADD CONSTRAINT "SolutionService_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionService" ADD CONSTRAINT "SolutionService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryTranslation" ADD CONSTRAINT "IndustryTranslation_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionIndustry" ADD CONSTRAINT "SolutionIndustry_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionIndustry" ADD CONSTRAINT "SolutionIndustry_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionProject" ADD CONSTRAINT "SolutionProject_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionProject" ADD CONSTRAINT "SolutionProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
