CREATE TABLE "InsightTaxonomy" (
 "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL,
 "language" "Locale" NOT NULL, "type" TEXT NOT NULL, "version" INTEGER NOT NULL DEFAULT 1,
 CONSTRAINT "InsightTaxonomy_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "InsightTaxonomy_type_check" CHECK ("type" IN ('category', 'tag'))
);
CREATE UNIQUE INDEX "InsightTaxonomy_slug_language_type_key" ON "InsightTaxonomy"("slug", "language", "type");
CREATE TABLE "InsightArticle" (
 "id" TEXT NOT NULL, "title" TEXT NOT NULL, "slug" TEXT NOT NULL,
 "excerpt" TEXT NOT NULL DEFAULT '', "content" JSONB NOT NULL,
 "coverImage" TEXT NOT NULL DEFAULT '', "coverImageAlt" TEXT NOT NULL DEFAULT '',
 "author" TEXT NOT NULL DEFAULT '', "categoryId" TEXT,
 "publicationDate" TIMESTAMP(3), "readingTime" INTEGER NOT NULL DEFAULT 1,
 "featured" BOOLEAN NOT NULL DEFAULT false, "status" TEXT NOT NULL DEFAULT 'draft',
 "language" "Locale" NOT NULL, "kind" TEXT NOT NULL DEFAULT 'blog',
 "seoTitle" TEXT NOT NULL DEFAULT '', "seoDescription" TEXT NOT NULL DEFAULT '',
 "ogImage" TEXT NOT NULL DEFAULT '', "canonicalUrl" TEXT NOT NULL DEFAULT '',
 "version" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "InsightArticle_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "InsightArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InsightTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "InsightArticle_status_check" CHECK ("status" IN ('draft', 'scheduled', 'published', 'archived')),
 CONSTRAINT "InsightArticle_kind_check" CHECK ("kind" IN ('blog', 'resource', 'case-study'))
);
CREATE UNIQUE INDEX "InsightArticle_slug_language_key" ON "InsightArticle"("slug", "language");
CREATE INDEX "InsightArticle_language_status_publicationDate_idx" ON "InsightArticle"("language", "status", "publicationDate");
CREATE TABLE "InsightArticleTag" (
 "articleId" TEXT NOT NULL, "tagId" TEXT NOT NULL,
 CONSTRAINT "InsightArticleTag_pkey" PRIMARY KEY ("articleId", "tagId"),
 CONSTRAINT "InsightArticleTag_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "InsightArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "InsightArticleTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "InsightTaxonomy"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "InsightArticleTag_tagId_idx" ON "InsightArticleTag"("tagId");
