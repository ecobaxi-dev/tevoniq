ALTER TABLE "CompanyPage" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN "createdById" TEXT, ADD COLUMN "updatedById" TEXT;
ALTER TABLE "InsightArticle" ADD COLUMN "createdById" TEXT, ADD COLUMN "updatedById" TEXT;
ALTER TABLE "CmsUser" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN "createdById" TEXT, ADD COLUMN "updatedById" TEXT;
ALTER TABLE "Service" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Solution" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Industry" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE TABLE "AdminRecord" (
 "id" TEXT NOT NULL, "module" TEXT NOT NULL, "title" TEXT NOT NULL, "language" "Locale" NOT NULL DEFAULT 'en', "status" TEXT NOT NULL DEFAULT 'draft',
 "data" JSONB NOT NULL DEFAULT '{}', "searchText" TEXT NOT NULL DEFAULT '', "version" INTEGER NOT NULL DEFAULT 1,
 "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 "deletedAt" TIMESTAMP(3), CONSTRAINT "AdminRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminRecord_module_deletedAt_status_updatedAt_idx" ON "AdminRecord"("module", "deletedAt", "status", "updatedAt");
CREATE TABLE "AdminReference" (
 "sourceId" TEXT NOT NULL, "targetId" TEXT NOT NULL, CONSTRAINT "AdminReference_pkey" PRIMARY KEY ("sourceId", "targetId"),
 CONSTRAINT "AdminReference_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "AdminRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "AdminReference_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "AdminRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AdminReference_targetId_idx" ON "AdminReference"("targetId");
