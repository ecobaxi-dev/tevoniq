CREATE TABLE "PestoCustomer" (
 "id" TEXT PRIMARY KEY, "email" TEXT NOT NULL UNIQUE,
 "managerName" TEXT NOT NULL, "businessName" TEXT NOT NULL, "country" TEXT NOT NULL,
 "phone" TEXT NOT NULL, "language" "Locale" NOT NULL, "emailVerifiedAt" TIMESTAMP(3) NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "PestoRegistration" (
 "id" TEXT PRIMARY KEY, "installationId" TEXT NOT NULL, "deviceHash" TEXT NOT NULL,
 "email" TEXT NOT NULL, "managerName" TEXT NOT NULL, "businessName" TEXT NOT NULL,
 "country" TEXT NOT NULL, "phone" TEXT NOT NULL, "language" "Locale" NOT NULL,
 "consentAt" TIMESTAMP(3) NOT NULL, "consentVersion" TEXT NOT NULL,
 "inputHash" TEXT NOT NULL, "clientSecretHash" TEXT NOT NULL,
 "codeNonce" TEXT NOT NULL, "codeHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
 "verificationAttempts" INTEGER NOT NULL DEFAULT 0 CHECK ("verificationAttempts" >= 0),
 "verifiedAt" TIMESTAMP(3), "customerId" TEXT REFERENCES "PestoCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "ticketHash" TEXT UNIQUE, "ticketExpiresAt" TIMESTAMP(3), "ticketConsumedAt" TIMESTAMP(3),
 "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("deliveryStatus" IN ('PENDING','RUNNING','SENT','FAILED','CANCELLED')),
 "deliveryAttempts" INTEGER NOT NULL DEFAULT 0 CHECK ("deliveryAttempts" >= 0),
 "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "claimedAt" TIMESTAMP(3),
 "leaseId" TEXT, "sentAt" TIMESTAMP(3), "lastError" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "PestoRegistration_deliveryStatus_availableAt_idx" ON "PestoRegistration"("deliveryStatus", "availableAt");
CREATE INDEX "PestoRegistration_expiresAt_idx" ON "PestoRegistration"("expiresAt");
CREATE INDEX "PestoRegistration_customerId_idx" ON "PestoRegistration"("customerId");
