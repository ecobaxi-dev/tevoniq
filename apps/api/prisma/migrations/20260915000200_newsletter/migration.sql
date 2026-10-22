CREATE TYPE "NewsletterStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED', 'BOUNCED');
CREATE TABLE "NewsletterSubscriber" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL DEFAULT '', "language" "Locale" NOT NULL DEFAULT 'en', "source" TEXT NOT NULL,
 "status" "NewsletterStatus" NOT NULL DEFAULT 'PENDING', "subscribedAt" TIMESTAMP(3), "unsubscribedAt" TIMESTAMP(3), "consentAt" TIMESTAMP(3) NOT NULL,
 "consentText" TEXT NOT NULL, "generation" INTEGER NOT NULL DEFAULT 1, "version" INTEGER NOT NULL DEFAULT 1,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "NewsletterSubscriber_status_language_createdAt_idx" ON "NewsletterSubscriber"("status", "language", "createdAt");
CREATE TABLE "NewsletterToken" (
 "tokenHash" TEXT PRIMARY KEY, "subscriberId" TEXT NOT NULL REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "purpose" TEXT NOT NULL, "generation" INTEGER NOT NULL, "expiresAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "NewsletterToken_subscriberId_purpose_idx" ON "NewsletterToken"("subscriberId", "purpose");
CREATE INDEX "NewsletterToken_expiresAt_idx" ON "NewsletterToken"("expiresAt");
CREATE TABLE "NewsletterDeliveryJob" (
 "id" TEXT PRIMARY KEY, "subscriberId" TEXT NOT NULL REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "kind" TEXT NOT NULL, "dedupeKey" TEXT NOT NULL UNIQUE, "generation" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING', "attempts" INTEGER NOT NULL DEFAULT 0, "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "claimedAt" TIMESTAMP(3), "leaseId" TEXT, "sentAt" TIMESTAMP(3), "lastError" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "NewsletterDeliveryJob_status_availableAt_idx" ON "NewsletterDeliveryJob"("status", "availableAt");
