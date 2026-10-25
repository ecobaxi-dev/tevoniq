import { apiEnvironmentSchema } from '@tevoniq/validation';
import { leadEnvironmentSchema } from '../leads/lead-config.js';
import { mediaEnvironmentSchema } from '../media/media-config.js';
import { pestoRegistrationEnvironmentSchema } from '../pesto/registration-config.js';
import { pestoTrialEnvironmentSchema } from '../pesto/trial-signing.js';
import { pestoPurchaseEnvironmentSchema } from '../pesto/purchase-config.js';
export function validateEnvironment(input: Record<string, unknown>) {
  const result = apiEnvironmentSchema.safeParse(input);
  if (!result.success) {
    // Report field names and validation messages, never raw secret values.
    throw new Error(
      'Invalid API environment: ' +
        result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    );
  }
  const leads = leadEnvironmentSchema.safeParse(input);
  if (!leads.success)
    throw new Error(
      'Invalid lead environment: ' +
        leads.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
    );
  const media = mediaEnvironmentSchema.safeParse(input);
  if (!media.success)
    throw new Error(
      'Invalid media configuration: ' +
        media.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('; '),
    );
  if (input.NODE_ENV === 'production' && media.data.MEDIA_STORAGE === 'local')
    throw new Error('Production requires MEDIA_STORAGE=s3 or disabled');
  const pesto = pestoRegistrationEnvironmentSchema.safeParse(input);
  if (!pesto.success)
    throw new Error(
      'Invalid Pesto registration configuration: ' +
        pesto.error.issues.map((i) => i.path.join('.')).join('; '),
    );
  const trials = pestoTrialEnvironmentSchema.safeParse(input);
  if (!trials.success)
    throw new Error(
      'Invalid Pesto trial configuration: ' +
        trials.error.issues.map((i) => i.path.join('.')).join('; '),
    );
  const purchases = pestoPurchaseEnvironmentSchema.safeParse(input);
  if (!purchases.success)
    throw new Error(
      'Invalid Pesto purchase configuration: ' +
        purchases.error.issues.map((i) => i.path.join('.')).join('; '),
    );
  return {
    ...result.data,
    ...leads.data,
    ...media.data,
    ...pesto.data,
    ...trials.data,
    ...purchases.data,
  };
}
