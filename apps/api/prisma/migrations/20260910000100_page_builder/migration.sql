CREATE TABLE "CmsPage" (
 "id" TEXT NOT NULL, "path" TEXT NOT NULL, "draft" JSONB NOT NULL, "published" JSONB,
 "publishedAt" TIMESTAMP(3), "version" INTEGER NOT NULL DEFAULT 1, "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3), CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CmsPage_path_key" ON "CmsPage"("path");
CREATE INDEX "CmsPage_deletedAt_publishedAt_updatedAt_idx" ON "CmsPage"("deletedAt","publishedAt","updatedAt");
CREATE TABLE "PageCatalogReference" (
 "id" TEXT NOT NULL, "pageId" TEXT NOT NULL, "serviceId" TEXT, "solutionId" TEXT, "industryId" TEXT, "projectId" TEXT,
 CONSTRAINT "PageCatalogReference_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "PageCatalogReference_one_target" CHECK (num_nonnulls("serviceId","solutionId","industryId","projectId")=1),
 CONSTRAINT "PageCatalogReference_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "PageCatalogReference_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "PageCatalogReference_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "PageCatalogReference_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "PageCatalogReference_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PageCatalogReference_pageId_serviceId_key" ON "PageCatalogReference"("pageId","serviceId");
CREATE UNIQUE INDEX "PageCatalogReference_pageId_solutionId_key" ON "PageCatalogReference"("pageId","solutionId");
CREATE UNIQUE INDEX "PageCatalogReference_pageId_industryId_key" ON "PageCatalogReference"("pageId","industryId");
CREATE UNIQUE INDEX "PageCatalogReference_pageId_projectId_key" ON "PageCatalogReference"("pageId","projectId");
CREATE INDEX "PageCatalogReference_serviceId_idx" ON "PageCatalogReference"("serviceId");
CREATE INDEX "PageCatalogReference_solutionId_idx" ON "PageCatalogReference"("solutionId");
CREATE INDEX "PageCatalogReference_industryId_idx" ON "PageCatalogReference"("industryId");
CREATE INDEX "PageCatalogReference_projectId_idx" ON "PageCatalogReference"("projectId");
CREATE TABLE "NewsletterSignup" ("email" TEXT NOT NULL,"recordId" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "NewsletterSignup_pkey" PRIMARY KEY("email"));
CREATE UNIQUE INDEX "NewsletterSignup_recordId_key" ON "NewsletterSignup"("recordId");
