CREATE TABLE "MediaAsset" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "title" TEXT NOT NULL, "originalName" TEXT NOT NULL,
 "alt" TEXT NOT NULL DEFAULT '', "caption" TEXT NOT NULL DEFAULT '', "collection" TEXT NOT NULL DEFAULT '',
 "mimeType" TEXT NOT NULL, "width" INTEGER NOT NULL, "height" INTEGER NOT NULL, "size" INTEGER NOT NULL,
 "sha256" TEXT NOT NULL, "storage" TEXT NOT NULL, "files" JSONB NOT NULL,
 "protected" BOOLEAN NOT NULL DEFAULT false, "version" INTEGER NOT NULL DEFAULT 1,
 "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3)
);
CREATE INDEX "MediaAsset_deletedAt_createdAt_idx" ON "MediaAsset"("deletedAt", "createdAt");
CREATE INDEX "MediaAsset_collection_deletedAt_idx" ON "MediaAsset"("collection", "deletedAt");
