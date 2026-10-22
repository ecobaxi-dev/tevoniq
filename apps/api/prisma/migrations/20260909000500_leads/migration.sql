CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST', 'SPAM');
CREATE TABLE "Lead" (
 "id" TEXT NOT NULL, "submissionId" TEXT NOT NULL, "submissionHash" TEXT NOT NULL, "type" TEXT NOT NULL, "language" "Locale" NOT NULL,
 "name" TEXT NOT NULL, "company" TEXT NOT NULL DEFAULT '', "email" TEXT NOT NULL, "phone" TEXT NOT NULL DEFAULT '', "country" TEXT NOT NULL,
 "subject" TEXT NOT NULL DEFAULT '', "message" TEXT NOT NULL DEFAULT '', "preferredContactMethod" TEXT NOT NULL DEFAULT 'email',
 "industry" TEXT NOT NULL DEFAULT '', "servicesInterested" JSONB NOT NULL DEFAULT '[]', "projectType" TEXT NOT NULL DEFAULT '', "budgetRange" TEXT NOT NULL DEFAULT '', "budgetLabel" TEXT NOT NULL DEFAULT '',
 "timeline" TEXT NOT NULL DEFAULT '', "projectDescription" TEXT NOT NULL DEFAULT '', "consent" BOOLEAN NOT NULL DEFAULT false, "consentAt" TIMESTAMP(3), "consentVersion" TEXT,
 "sourcePage" TEXT NOT NULL, "utm" JSONB NOT NULL DEFAULT '{}', "status" "LeadStatus" NOT NULL DEFAULT 'NEW', "version" INTEGER NOT NULL DEFAULT 1,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "updatedById" TEXT, "deletedAt" TIMESTAMP(3), CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Lead_submissionId_key" ON "Lead"("submissionId");
CREATE INDEX "Lead_status_deletedAt_createdAt_idx" ON "Lead"("status", "deletedAt", "createdAt");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE TABLE "LeadAttachment" (
 "id" TEXT NOT NULL, "leadId" TEXT NOT NULL, "name" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "size" INTEGER NOT NULL, "bytes" BYTEA NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LeadAttachment_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "LeadAttachment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE "LeadActivity" (
 "id" TEXT NOT NULL, "leadId" TEXT NOT NULL, "actorId" TEXT, "action" TEXT NOT NULL, "note" TEXT NOT NULL DEFAULT '', "fromStatus" "LeadStatus", "toStatus" "LeadStatus",
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");
CREATE TABLE "LeadSettings" ("id" TEXT NOT NULL DEFAULT 'default', "value" JSONB NOT NULL, "version" INTEGER NOT NULL DEFAULT 1, "updatedById" TEXT, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "LeadSettings_pkey" PRIMARY KEY ("id"));
CREATE TABLE "LeadThrottle" ("key" TEXT NOT NULL, "attempts" INTEGER NOT NULL DEFAULT 0, "expiresAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "LeadThrottle_pkey" PRIMARY KEY ("key"));
CREATE INDEX "LeadThrottle_expiresAt_idx" ON "LeadThrottle"("expiresAt");
CREATE TABLE "LeadEmail" (
 "id" TEXT NOT NULL, "leadId" TEXT NOT NULL, "kind" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending', "attempts" INTEGER NOT NULL DEFAULT 0,
 "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lockedUntil" TIMESTAMP(3), "sentAt" TIMESTAMP(3), "lastError" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LeadEmail_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "LeadEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "LeadEmail_leadId_kind_key" ON "LeadEmail"("leadId", "kind");
CREATE INDEX "LeadEmail_status_nextAttemptAt_idx" ON "LeadEmail"("status", "nextAttemptAt");

-- Preserve existing manually entered business records without sending retrospective email.
INSERT INTO "Lead" ("id", "submissionId", "submissionHash", "type", "language", "name", "company", "email", "phone", "country", "subject", "message", "sourcePage", "status", "createdAt", "updatedAt", "updatedById", "deletedAt")
SELECT "id", "id", 'legacy-import', 'contact', "language", "title", COALESCE("data"->>'company',''), COALESCE("data"->>'email',''), COALESCE("data"->>'phone',''), '', "title", COALESCE("data"->>'message',"data"->>'notes',''), '/contact',
 CASE "status" WHEN 'open' THEN 'CONTACTED'::"LeadStatus" WHEN 'qualified' THEN 'QUALIFIED'::"LeadStatus" WHEN 'closed' THEN 'LOST'::"LeadStatus" ELSE 'NEW'::"LeadStatus" END,
 "createdAt", "updatedAt", "updatedById", "deletedAt" FROM "AdminRecord" WHERE "module" IN ('leads','messages');
INSERT INTO "LeadActivity" ("id", "leadId", "actorId", "action", "note", "createdAt") SELECT "id", "id", "updatedById", 'lead.imported', 'Imported from the previous admin workspace; original timestamps preserved.', CURRENT_TIMESTAMP FROM "Lead" WHERE "submissionHash" = 'legacy-import';
