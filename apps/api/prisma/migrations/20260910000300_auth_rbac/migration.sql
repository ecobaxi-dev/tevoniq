ALTER TYPE "CmsRole" ADD VALUE 'MARKETING';
ALTER TYPE "CmsRole" ADD VALUE 'SALES';
ALTER TYPE "CmsRole" ADD VALUE 'HR';
ALTER TABLE "CmsUser" ADD COLUMN "lastLoginAt" TIMESTAMP(3), ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CmsSession" ADD COLUMN "id" TEXT, ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "userAgent" TEXT NOT NULL DEFAULT '';
UPDATE "CmsSession" SET "id" = gen_random_uuid()::text;
ALTER TABLE "CmsSession" ALTER COLUMN "id" SET NOT NULL;
CREATE UNIQUE INDEX "CmsSession_id_key" ON "CmsSession"("id");
CREATE INDEX "CmsSession_userId_idx" ON "CmsSession"("userId");
CREATE TABLE "CmsPasswordReset" (
 "tokenHash" TEXT PRIMARY KEY, "userId" TEXT NOT NULL UNIQUE, "authVersion" INTEGER NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CmsPasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CmsUser"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CmsPasswordReset_expiresAt_idx" ON "CmsPasswordReset"("expiresAt");
CREATE TABLE "CmsRecoveryJob" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "claimedAt" TIMESTAMP(3), "attempts" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX "CmsRecoveryJob_createdAt_idx" ON "CmsRecoveryJob"("createdAt");
