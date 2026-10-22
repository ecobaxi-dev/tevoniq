CREATE TYPE "IndustryStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Industry"
  ADD COLUMN "status" "IndustryStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedById" TEXT;

-- Preserve existing editorial descriptions and SolutionIndustry memberships.
ALTER TABLE "IndustryTranslation" RENAME COLUMN "description" TO "shortDescription";
ALTER TABLE "IndustryTranslation"
  ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "blocks" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Industry" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "IndustryTranslation" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "SolutionIndustry" ADD COLUMN "industrySortOrder" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "IndustryService" (
  "industryId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "IndustryService_pkey" PRIMARY KEY ("industryId", "serviceId")
);
CREATE TABLE "IndustryProject" (
  "industryId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "IndustryProject_pkey" PRIMARY KEY ("industryId", "projectId")
);
CREATE INDEX "Industry_active_published_status_featured_sortOrder_slug_idx" ON "Industry"("active", "published", "status", "featured", "sortOrder", "slug");
CREATE INDEX "Industry_createdById_idx" ON "Industry"("createdById");
CREATE INDEX "Industry_updatedById_idx" ON "Industry"("updatedById");
CREATE INDEX "SolutionIndustry_industryId_industrySortOrder_idx" ON "SolutionIndustry"("industryId", "industrySortOrder");
CREATE INDEX "IndustryService_serviceId_idx" ON "IndustryService"("serviceId");
CREATE INDEX "IndustryService_industryId_sortOrder_idx" ON "IndustryService"("industryId", "sortOrder");
CREATE INDEX "IndustryProject_projectId_idx" ON "IndustryProject"("projectId");
CREATE INDEX "IndustryProject_industryId_sortOrder_idx" ON "IndustryProject"("industryId", "sortOrder");
ALTER TABLE "Industry" ADD CONSTRAINT "Industry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Industry" ADD CONSTRAINT "Industry_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IndustryService" ADD CONSTRAINT "IndustryService_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryService" ADD CONSTRAINT "IndustryService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryProject" ADD CONSTRAINT "IndustryProject_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IndustryProject" ADD CONSTRAINT "IndustryProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
