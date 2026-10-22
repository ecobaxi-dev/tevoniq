CREATE TYPE "ClientVisibility" AS ENUM ('PUBLIC', 'ANONYMOUS', 'PRIVATE');
ALTER TABLE "Project"
 ADD COLUMN "clientName" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "clientVisibility" "ClientVisibility" NOT NULL DEFAULT 'PRIVATE',
 ADD COLUMN "country" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "city" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "projectDate" DATE,
 ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
 ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 ADD COLUMN "createdById" TEXT,
 ADD COLUMN "updatedById" TEXT;
ALTER TABLE "ProjectTranslation"
 ADD COLUMN "anonymousClientName" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "heroImage" JSONB,
 ADD COLUMN "gallery" JSONB NOT NULL DEFAULT '[]',
 ADD COLUMN "challenge" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "approach" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "solution" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "implementation" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "technologies" JSONB NOT NULL DEFAULT '[]',
 ADD COLUMN "results" JSONB NOT NULL DEFAULT '[]',
 ADD COLUMN "testimonial" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "testimonialAuthor" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Project" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "ProjectTranslation" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "IndustryProject" ADD COLUMN "projectSortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SolutionProject" ADD COLUMN "projectSortOrder" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "ProjectService" (
 "projectId" TEXT NOT NULL, "serviceId" TEXT NOT NULL, "sortOrder" INTEGER NOT NULL DEFAULT 0,
 CONSTRAINT "ProjectService_pkey" PRIMARY KEY ("projectId", "serviceId")
);
CREATE INDEX "Project_published_verified_featured_sortOrder_slug_idx" ON "Project"("published", "verified", "featured", "sortOrder", "slug");
CREATE INDEX "Project_createdById_idx" ON "Project"("createdById");
CREATE INDEX "Project_updatedById_idx" ON "Project"("updatedById");
CREATE INDEX "ProjectTranslation_locale_published_idx" ON "ProjectTranslation"("locale", "published");
CREATE INDEX "IndustryProject_projectId_projectSortOrder_idx" ON "IndustryProject"("projectId", "projectSortOrder");
CREATE INDEX "SolutionProject_projectId_projectSortOrder_idx" ON "SolutionProject"("projectId", "projectSortOrder");
CREATE INDEX "ProjectService_serviceId_idx" ON "ProjectService"("serviceId");
CREATE INDEX "ProjectService_projectId_sortOrder_idx" ON "ProjectService"("projectId", "sortOrder");
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
