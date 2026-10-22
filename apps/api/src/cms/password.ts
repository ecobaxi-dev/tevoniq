import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { HttpException } from '@nestjs/common';
let activeDerivations = 0;
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
async function derive(password: string, salt: string): Promise<Buffer> {
  if (activeDerivations >= 2) throw new HttpException('Authentication is busy. Retry shortly.', 429);
  activeDerivations++;
  try { return await new Promise<Buffer>((resolve, reject) =>
    scrypt(
      password,
      salt,
      64,
      { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  ); } finally { activeDerivations--; }
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await derive(password, salt)).toString('hex')}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash)) return false;
  return timingSafeEqual(await derive(password, salt), Buffer.from(hash, 'hex'));
}
