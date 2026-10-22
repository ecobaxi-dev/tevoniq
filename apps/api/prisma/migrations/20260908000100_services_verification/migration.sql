ALTER TYPE "CmsRole" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "CmsRole" ADD VALUE 'CONTENT_MANAGER';
ALTER TYPE "CmsRole" ADD VALUE 'VIEWER';

ALTER TABLE "Service" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "createdById" TEXT, ADD COLUMN "updatedById" TEXT;
CREATE INDEX "Service_active_sortOrder_slug_idx" ON "Service"("active", "sortOrder", "slug");
CREATE INDEX "Service_createdById_idx" ON "Service"("createdById");
CREATE INDEX "Service_updatedById_idx" ON "Service"("updatedById");
ALTER TABLE "Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Service" ADD CONSTRAINT "Service_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
