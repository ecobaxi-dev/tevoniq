import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import type { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
export abstract class StorageProvider {
  abstract readonly name: 'local' | 's3' | 'disabled';
  abstract put(key: string, bytes: Buffer, mime: string): Promise<void>;
  abstract get(key: string): Promise<Buffer>;
  abstract remove(key: string): Promise<void>;
}
function checkKey(key: string) {
  if (
    !/^[a-f0-9-]{36}\/(original\.(jpg|png|webp|avif|svg)|(?:thumb|medium|large)\.webp)$/.test(key)
  )
    throw new Error('Invalid storage key');
}
export class LocalStorageProvider extends StorageProvider {
  readonly name = 'local' as const;
  private root: string;
  constructor(root: string) {
    super();
    this.root = resolve(root);
  }
  private path(key: string) {
    checkKey(key);
    return resolve(this.root, key);
  }
  async put(key: string, bytes: Buffer) {
    const path = this.path(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes, { flag: 'wx', mode: 0o600 });
  }
  get(key: string) {
    return readFile(this.path(key));
  }
  async remove(key: string) {
    await unlink(this.path(key)).catch((e: NodeJS.ErrnoException) => {
      if (e.code !== 'ENOENT') throw e;
    });
  }
}
export class S3StorageProvider extends StorageProvider {
  readonly name = 's3' as const;
  private client: S3Client;
  private bucket: string;
  constructor(config: ConfigService) {
    super();
    this.bucket = config.getOrThrow<string>('MEDIA_S3_BUCKET');
    const endpoint = config.get<string>('MEDIA_S3_ENDPOINT');
    this.client = new S3Client({
      region: config.getOrThrow<string>('MEDIA_S3_REGION'),
      ...(endpoint ? { endpoint } : {}),
      forcePathStyle: config.get<string>('MEDIA_S3_FORCE_PATH_STYLE') === 'true',
    });
  }
  async put(key: string, bytes: Buffer, mime: string) {
    checkKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: bytes,
        ContentType: mime,
        IfNoneMatch: '*',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }
  async get(key: string) {
    checkKey(key);
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) throw new Error('Missing object');
    return Buffer.from(await result.Body.transformToByteArray());
  }
  async remove(key: string) {
    checkKey(key);
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
export class DisabledStorageProvider extends StorageProvider {
  readonly name = 'disabled' as const;
  async put(): Promise<void> {
    throw new ServiceUnavailableException('File uploads are currently unavailable');
  }
  async get(): Promise<Buffer> {
    throw new ServiceUnavailableException('Media storage is currently unavailable');
  }
  async remove(): Promise<void> {
    throw new ServiceUnavailableException('Media storage is currently unavailable');
  }
}
export const storageFactory = (config: ConfigService): StorageProvider =>
  config.get('MEDIA_STORAGE') === 'disabled'
    ? new DisabledStorageProvider()
    : config.get('MEDIA_STORAGE') === 's3'
      ? new S3StorageProvider(config)
      : new LocalStorageProvider(config.getOrThrow<string>('MEDIA_LOCAL_ROOT'));
