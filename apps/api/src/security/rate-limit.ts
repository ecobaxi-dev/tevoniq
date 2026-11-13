import { rateLimit } from 'express-rate-limit';
import type { Request } from 'express';
import { submissionIp } from '../leads/bot-protection.js';

/** Only the ingress-authenticated IP may override the transport peer. */
export function clientRateKey(req: Request, secret?: string) {
  return submissionIp(req, secret);
}
export function apiRateLimiter(secret?: string, privateLoopback = false) {
  return rateLimit({
    windowMs: 60000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: (req) => clientRateKey(req, secret),
    skip: (req) => {
      if (req.path === '/api/v1/health/live') return ['GET', 'HEAD'].includes(req.method);
      // Cached public reads are internal server-to-server work, not individual visitor requests.
      // Do not apply one visitor's quota to all SSR fetches. Writes and all CMS routes stay limited.
      const peer = req.socket.remoteAddress;
      return (
        privateLoopback &&
        ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(peer || '') &&
        ['GET', 'HEAD'].includes(req.method) &&
        !req.path.startsWith('/api/v1/cms')
      );
    },
    message: { message: 'Too many requests. Please try again shortly.' },
  });
}
