import 'server-only';
import type { HealthResponse } from '@tevoniq/types';
import { env } from './env';
export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${env.API_URL}/health/live`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<HealthResponse>;
}
