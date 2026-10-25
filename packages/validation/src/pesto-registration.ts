import { z } from 'zod';

const identifier = z.uuid().transform((value) => value.toLowerCase());
const secret = z.string().regex(/^[a-f0-9]{64}$/);
const plainText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) =>
      [...value].every((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127),
    );
export const registrationInputSchema = z.strictObject({
  requestId: identifier,
  installationId: identifier,
  deviceHash: z.string().regex(/^[A-F0-9]{64}$/),
  clientSecret: secret,
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  managerName: plainText(120),
  businessName: plainText(200),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9 ()-]{7,30}$/)
    .refine((value) => (value.match(/\d/g) ?? []).length >= 7),
  language: z.enum(['en', 'ar', 'tr']),
  consent: z.literal(true),
  botToken: z.string().max(2048).default(''),
});
export const verificationInputSchema = z.strictObject({
  requestId: identifier,
  clientSecret: secret,
  code: z.string().regex(/^\d{8}$/),
});
export type RegistrationInput = z.infer<typeof registrationInputSchema>;
export type VerificationInput = z.infer<typeof verificationInputSchema>;
export const trialInputSchema = z.strictObject({
  registrationTicket: z.string().regex(/^[a-f0-9]{64}$/),
  installationId: z.uuid().transform((v) => v.toLowerCase()),
  deviceHash: z.string().regex(/^[A-F0-9]{64}$/),
});
export const purchaseIssueInputSchema = z.strictObject({
  requestId: identifier,
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  reference: plainText(120),
});
export const purchaseActivationInputSchema = trialInputSchema.extend({
  purchaseKey: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^PSTO-[A-F0-9]{64}$/),
});
