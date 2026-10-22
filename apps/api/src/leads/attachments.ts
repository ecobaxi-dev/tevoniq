import type { ConfigService } from '@nestjs/config';
import { scanClamAv } from '../careers/cv-security.js';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
export const MAX_ATTACHMENT_SIZE = 2 * 1024 * 1024;
export function validateAttachments(files: Express.Multer.File[]) {
  if (files.length > 3) throw new BadRequestException('Attach up to three files');
  return files.map((file) => {
    if (
      !file.buffer?.length ||
      file.size !== file.buffer.length ||
      file.buffer.length > MAX_ATTACHMENT_SIZE
    )
      throw new BadRequestException('Each attachment must be between 1 byte and 2 MB');
    const bytes = file.buffer;
    const mimeType =
      bytes.subarray(0, 5).toString('ascii') === '%PDF-'
        ? 'application/pdf'
        : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          ? 'image/png'
          : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            ? 'image/jpeg'
            : null;
    if (!mimeType || mimeType !== file.mimetype)
      throw new BadRequestException('Attachments must be valid PDF, PNG, or JPEG files');
    const name =
      file.originalname
        .split(/[\\/]/)
        .pop()!
        .normalize('NFKC')
        .replace(/[^\p{L}\p{N} ._-]/gu, '_')
        .slice(0, 160) || 'attachment';
    return { name, mimeType, size: bytes.length, bytes: new Uint8Array(bytes) };
  });
}

export async function scanAttachments(files: Array<{ bytes: Uint8Array }>, config: ConfigService) {
  if (files.length) {
    const host = config.get<string>('CV_CLAMAV_HOST');
    if (!host && config.get('NODE_ENV') === 'production')
      throw new ServiceUnavailableException('Attachment scanning is temporarily unavailable');
    if (host) {
      const port = Number(config.get('CV_CLAMAV_PORT') || 3310);
      if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new ServiceUnavailableException('Attachment scanner configuration is invalid');
      for (const file of files) await scanClamAv(file.bytes, host, port);
    }
  }
}
