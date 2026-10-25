import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { RegistrationInput } from '@tevoniq/validation';
export {
  registrationInputSchema,
  verificationInputSchema,
  type RegistrationInput,
  type VerificationInput,
} from '@tevoniq/validation';

export const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function equalDigest(a: string, b: string) {
  return (
    /^[a-f0-9]{64}$/.test(a) &&
    /^[a-f0-9]{64}$/.test(b) &&
    timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  );
}
export function verificationCode(key: Buffer, id: string, nonce: string) {
  const bytes = createHmac('sha256', key).update(`Pesto.Email.Code.v1:${id}:${nonce}`).digest();
  return (bytes.readUInt32BE(0) % 100000000).toString().padStart(8, '0');
}
export function codeDigest(key: Buffer, id: string, code: string) {
  return createHmac('sha256', key).update(`Pesto.Email.Proof.v1:${id}:${code}`).digest('hex');
}
export function registrationTicket(key: Buffer, id: string, nonce: string, clientHash: string) {
  return createHmac('sha256', key)
    .update(`Pesto.Registration.Ticket.v1:${id}:${nonce}:${clientHash}`)
    .digest('hex');
}
export function inputDigest(input: RegistrationInput) {
  // Stable selected fields; a fresh anti-bot token is not an identity/profile change.
  return hash(
    JSON.stringify([
      input.requestId,
      input.installationId,
      input.deviceHash,
      hash(input.clientSecret),
      input.email,
      input.managerName,
      input.businessName,
      input.country,
      input.phone,
      input.language,
      input.consent,
    ]),
  );
}
export function verificationMessage(language: 'en' | 'ar' | 'tr', code: string, requestId: string) {
  return {
    en: {
      subject: 'Verify your email for Pesto — TEVONIQ',
      text: `Your Pesto email verification code is: ${code}\n\nIt expires 20 minutes after the registration request was created. Enter it only in the Pesto registration you started. This verifies your email; it does not start a trial or activate a license.\n\nRequest: ${requestId}\n\nIf you did not request this, ignore this email. Do not share this code.\n\nTEVONIQ — https://tevoniq.com/pesto`,
    },
    ar: {
      subject: 'تحقق من بريدك لتسجيل بيستو — TEVONIQ',
      text: `رمز التحقق من بريدك لتسجيل بيستو: ${code}\n\nتنتهي صلاحيته بعد 20 دقيقة من إنشاء طلب التسجيل. أدخله فقط في عملية التسجيل التي بدأتَها في بيستو. التحقق من البريد لا يبدأ التجربة ولا يفعّل الترخيص.\n\nمرجع الطلب: ${requestId}\n\nإذا لم تطلب التسجيل، تجاهل هذه الرسالة. لا تشارك الرمز مع الآخرين.\n\nTEVONIQ — https://tevoniq.com/pesto`,
    },
    tr: {
      subject: 'Pesto için e-postanızı doğrulayın — TEVONIQ',
      text: `Pesto e-posta doğrulama kodunuz: ${code}\n\nKayıt isteğinin oluşturulmasından itibaren 20 dakika geçerlidir. Kodu yalnızca başlattığınız Pesto kaydına girin. Bu işlem e-postanızı doğrular; deneme başlatmaz veya lisans etkinleştirmez.\n\nİstek: ${requestId}\n\nBu isteği siz yapmadıysanız e-postayı yok sayın. Kodu paylaşmayın.\n\nTEVONIQ — https://tevoniq.com/pesto`,
    },
  }[language];
}
