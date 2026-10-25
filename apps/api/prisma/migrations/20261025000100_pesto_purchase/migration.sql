CREATE TABLE "PestoPurchaseKey" (
 "id" TEXT PRIMARY KEY,
 "customerId" TEXT NOT NULL REFERENCES "PestoCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "keyHash" TEXT NOT NULL UNIQUE,
 "keyNonce" TEXT NOT NULL,
 "reference" TEXT NOT NULL,
 "createdById" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "revokedAt" TIMESTAMP(3),
 "revokedById" TEXT,
 "consumedAt" TIMESTAMP(3)
);
CREATE INDEX "PestoPurchaseKey_customerId_createdAt_idx" ON "PestoPurchaseKey"("customerId", "createdAt");
CREATE TABLE "PestoPerpetualLicense" (
 "id" TEXT PRIMARY KEY,
 "purchaseId" TEXT NOT NULL UNIQUE REFERENCES "PestoPurchaseKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "customerId" TEXT NOT NULL REFERENCES "PestoCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "registrationId" TEXT NOT NULL,
 "installationId" TEXT NOT NULL UNIQUE,
 "deviceHash" TEXT NOT NULL UNIQUE,
 "issuedAt" TIMESTAMP(3) NOT NULL,
 "envelope" TEXT NOT NULL
);
CREATE INDEX "PestoPerpetualLicense_customerId_idx" ON "PestoPerpetualLicense"("customerId");
CREATE TABLE "PestoActivationGrant" (
 "registrationId" TEXT PRIMARY KEY REFERENCES "PestoRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "licenseId" TEXT NOT NULL REFERENCES "PestoPerpetualLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "retryUntil" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PestoActivationGrant_licenseId_idx" ON "PestoActivationGrant"("licenseId");
CREATE TABLE "PestoLicenseDelivery" (
 "licenseId" TEXT PRIMARY KEY REFERENCES "PestoPerpetualLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "status" TEXT NOT NULL DEFAULT 'PENDING',
 "attempts" INTEGER NOT NULL DEFAULT 0,
 "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "claimedAt" TIMESTAMP(3),
 "leaseId" TEXT,
 "sentAt" TIMESTAMP(3),
 "lastError" TEXT
);
CREATE INDEX "PestoLicenseDelivery_status_availableAt_idx" ON "PestoLicenseDelivery"("status", "availableAt");
