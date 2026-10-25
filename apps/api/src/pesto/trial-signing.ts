import { createPrivateKey, sign, type KeyObject } from 'node:crypto';
import { z } from 'zod';

export function readTrialKey(encoded: string): KeyObject {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded) || encoded.length > 4096)
    throw new Error('Invalid licensing key');
  const bytes = Buffer.from(encoded, 'base64');
  try {
    const key = createPrivateKey({ key: bytes, format: 'der', type: 'pkcs8' });
    if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1')
      throw new Error('Licensing requires P-256');
    return key;
  } finally {
    bytes.fill(0);
  }
}

export const pestoTrialEnvironmentSchema = z
  .object({
    PESTO_TRIAL_ENABLED: z.enum(['true', 'false']).default('false'),
    PESTO_REGISTRATION_ENABLED: z.enum(['true', 'false']).default('false'),
    PESTO_LICENSE_KEY_ID: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,80}$/)
      .optional(),
    PESTO_LICENSE_PRIVATE_KEY: z.string().max(4096).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.PESTO_TRIAL_ENABLED !== 'true') return;
    if (value.PESTO_REGISTRATION_ENABLED !== 'true')
      ctx.addIssue({ code: 'custom', path: ['PESTO_REGISTRATION_ENABLED'], message: 'Required' });
    if (!value.PESTO_LICENSE_KEY_ID)
      ctx.addIssue({ code: 'custom', path: ['PESTO_LICENSE_KEY_ID'], message: 'Required' });
    try {
      readTrialKey(value.PESTO_LICENSE_PRIVATE_KEY ?? '');
    } catch {
      ctx.addIssue({
        code: 'custom',
        path: ['PESTO_LICENSE_PRIVATE_KEY'],
        message: 'Invalid licensing key',
      });
    }
  });

export function signTrial(
  key: KeyObject,
  keyId: string,
  claims: {
    licenseId: string;
    registrationId: string;
    installationId: string;
    deviceHash: string;
    issuedAt: Date;
    expiresAt: Date;
  },
) {
  return signPermit(key, keyId, claims, 'trial');
}

export function signPerpetual(
  key: KeyObject,
  keyId: string,
  claims: {
    licenseId: string;
    registrationId: string;
    installationId: string;
    deviceHash: string;
    issuedAt: Date;
  },
) {
  return signPermit(key, keyId, { ...claims, expiresAt: null }, 'perpetual');
}

function signPermit(
  key: KeyObject,
  keyId: string,
  claims: {
    licenseId: string;
    registrationId: string;
    installationId: string;
    deviceHash: string;
    issuedAt: Date;
    expiresAt: Date | null;
  },
  kind: 'trial' | 'perpetual',
) {
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      issuer: 'TEVONIQ',
      product: 'Pesto.Lite',
      signingKeyId: keyId,
      licenseId: claims.licenseId,
      registrationId: claims.registrationId,
      installationId: claims.installationId,
      deviceHash: claims.deviceHash,
      kind,
      issuedAtUtc: claims.issuedAt.toISOString(),
      expiresAtUtc: claims.expiresAt?.toISOString() ?? null,
      emailVerified: true,
      maxUsers: 2,
      maxConcurrentDevices: 2,
    }),
  );
  return JSON.stringify({
    keyId,
    payload: payload.toString('base64'),
    signature: sign('sha256', payload, { key, dsaEncoding: 'ieee-p1363' }).toString('base64'),
  });
}
