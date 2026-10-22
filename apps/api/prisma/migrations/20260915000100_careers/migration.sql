CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED');
CREATE TABLE "CareerJob" (
 "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "slug" TEXT NOT NULL UNIQUE, "department" TEXT NOT NULL, "location" TEXT NOT NULL,
 "employmentType" "EmploymentType" NOT NULL, "workMode" "WorkMode" NOT NULL, "description" TEXT NOT NULL DEFAULT '',
 "responsibilities" TEXT[] NOT NULL, "requirements" TEXT[] NOT NULL, "preferredQualifications" TEXT[] NOT NULL,
 "status" "JobStatus" NOT NULL DEFAULT 'DRAFT', "publishedAt" TIMESTAMP(3), "closingDate" TIMESTAMP(3),
 "version" INTEGER NOT NULL DEFAULT 1, "createdById" TEXT NOT NULL, "updatedById" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "CareerJob_status_publishedAt_closingDate_idx" ON "CareerJob"("status", "publishedAt", "closingDate");
CREATE TABLE "JobApplication" (
 "id" TEXT PRIMARY KEY, "jobId" TEXT NOT NULL REFERENCES "CareerJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "submissionId" TEXT NOT NULL UNIQUE, "submissionHash" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
 "phone" TEXT NOT NULL DEFAULT '', "location" TEXT NOT NULL, "linkedIn" TEXT NOT NULL DEFAULT '', "portfolio" TEXT NOT NULL DEFAULT '',
 "coverLetter" TEXT NOT NULL DEFAULT '', "consentAt" TIMESTAMP(3) NOT NULL, "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
 "version" INTEGER NOT NULL DEFAULT 1, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "JobApplication_jobId_status_createdAt_idx" ON "JobApplication"("jobId", "status", "createdAt");
CREATE INDEX "JobApplication_status_createdAt_idx" ON "JobApplication"("status", "createdAt");
CREATE TABLE "JobCv" (
 "id" TEXT PRIMARY KEY, "applicationId" TEXT NOT NULL UNIQUE REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "name" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "size" INTEGER NOT NULL, "sha256" TEXT NOT NULL, "bytes" BYTEA NOT NULL,
 "scanStatus" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "JobApplicationHistory" (
 "id" TEXT PRIMARY KEY, "applicationId" TEXT NOT NULL REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 "action" TEXT NOT NULL, "fromStatus" "ApplicationStatus", "toStatus" "ApplicationStatus", "note" TEXT NOT NULL DEFAULT '',
 "actorId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "JobApplicationHistory_applicationId_createdAt_idx" ON "JobApplicationHistory"("applicationId", "createdAt");
