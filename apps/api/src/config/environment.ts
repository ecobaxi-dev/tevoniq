import { apiEnvironmentSchema } from '@tevoniq/validation';
import { leadEnvironmentSchema } from '../leads/lead-config.js';
import { mediaEnvironmentSchema } from '../media/media-config.js';
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
  return { ...result.data, ...leads.data, ...media.data };
}
