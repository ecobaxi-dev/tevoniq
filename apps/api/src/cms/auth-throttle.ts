import { HttpException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service.js';
import { digest } from './password.js';
export async function throttleAuth(
  db: DatabaseService,
  scope: string,
  ip: string,
  account?: string,
) {
  for (const [key, limit] of [
    [digest(`${scope}:ip:${ip}`), 60],
    ...(account ? [[digest(`${scope}:account:${account}`), scope === 'recovery' ? 3 : 10]] : []),
  ] as [string, number][]) {
    const rows = await db.$queryRaw<{ attempts: number }[]>`
      INSERT INTO "LoginThrottle" ("key", "attempts", "resetAt") VALUES (${key}, 1, (NOW() AT TIME ZONE 'UTC') + INTERVAL '15 minutes')
      ON CONFLICT ("key") DO UPDATE SET
        "attempts" = CASE WHEN "LoginThrottle"."resetAt" <= (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE "LoginThrottle"."attempts" + 1 END,
        "resetAt" = CASE WHEN "LoginThrottle"."resetAt" <= (NOW() AT TIME ZONE 'UTC') THEN (NOW() AT TIME ZONE 'UTC') + INTERVAL '15 minutes' ELSE "LoginThrottle"."resetAt" END
      RETURNING "attempts"`;
    if (rows[0]!.attempts > limit)
      throw new HttpException('Too many attempts. Try again later.', 429);
  }
}
