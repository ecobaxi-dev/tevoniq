CREATE TABLE "PestoTrial" (
 "id" TEXT PRIMARY KEY,
 "customerId" TEXT NOT NULL REFERENCES "PestoCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "registrationId" TEXT NOT NULL,
 "installationId" TEXT NOT NULL,
 "deviceHash" TEXT NOT NULL,
 "issuedAt" TIMESTAMP(3) NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "envelope" TEXT NOT NULL,
 CONSTRAINT "PestoTrial_exact_duration" CHECK ("expiresAt" = "issuedAt" + INTERVAL '15 days')
);
CREATE UNIQUE INDEX "PestoTrial_installationId_key" ON "PestoTrial"("installationId");
CREATE UNIQUE INDEX "PestoTrial_deviceHash_key" ON "PestoTrial"("deviceHash");
CREATE INDEX "PestoTrial_customerId_idx" ON "PestoTrial"("customerId");
CREATE TABLE "PestoTrialGrant" (
 "registrationId" TEXT PRIMARY KEY REFERENCES "PestoRegistration"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "trialId" TEXT NOT NULL REFERENCES "PestoTrial"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "retryUntil" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "PestoTrialGrant_trialId_idx" ON "PestoTrialGrant"("trialId");
