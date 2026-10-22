import 'server-only';
import { webEnvironmentSchema } from '@tevoniq/validation';
export const env = webEnvironmentSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.API_URL,
  SITE_URL: process.env.SITE_URL,
});
