import { BadRequestException, ServiceUnavailableException, Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'node:net';
import { createHash } from 'node:crypto';
import { MAX_CV_BYTES } from '@tevoniq/validation';

export function validateCv(file: Express.Multer.File | undefined) {
  if (!file || !file.buffer?.length || file.buffer.length > MAX_CV_BYTES || file.size !== file.buffer.length)
    throw new BadRequestException('Attach one PDF CV, up to 5 MB');
  if (!/\.pdf$/i.test(file.originalname) || file.mimetype !== 'application/pdf')
    throw new BadRequestException('CV must be a PDF file');
  const bytes = file.buffer;
  if (!/^%PDF-(?:1\.[0-7]|2\.0)[\r\n]/.test(bytes.subarray(0, 12).toString('ascii')) ||
      !/%%EOF\s*$/.test(bytes.subarray(-1024).toString('latin1')))
    throw new BadRequestException('CV must be a complete PDF file');
  // Supplemental screening, not a replacement for malware scanning or a PDF parser.
  const source = bytes.toString('latin1').replace(/#([a-f0-9]{2})/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  if (/\/(?:JavaScript|JS|Launch|EmbeddedFile|RichMedia|OpenAction|AA|Encrypt)\b/i.test(source))
    throw new BadRequestException('Use a PDF without encryption, scripts, actions or embedded files');
  const stem = file.originalname.split(/[\\/]/).pop()!.replace(/\.pdf$/i, '').normalize('NFKC').replace(/[^\p{L}\p{N} _-]/gu, '_').slice(0, 110) || 'CV';
  return { name: `${stem}.pdf`, mimeType: 'application/pdf', size: bytes.length, bytes: new Uint8Array(bytes), sha256: createHash('sha256').update(bytes).digest('hex') };
}

export function scanClamAv(bytes: Uint8Array, host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    let output = '', finished = false;
    const complete = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error); else resolve();
    };
    const unavailable = () => complete(new ServiceUnavailableException('CV scanning is unavailable. Please try again later.'));
    const timer = setTimeout(unavailable, 15000);
    socket.on('error', unavailable);
    socket.on('end', () => { if (!finished) unavailable(); });
    socket.on('connect', () => {
      const chunks = [Buffer.from('zINSTREAM\0')];
      for (let start = 0; start < bytes.length; start += 65536) {
        const chunk = Buffer.from(bytes.subarray(start, start + 65536)), size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        chunks.push(size, chunk);
      }
      chunks.push(Buffer.alloc(4));
      socket.write(Buffer.concat(chunks));
    });
    socket.on('data', (chunk: Buffer) => {
      output += chunk.toString('utf8');
      if (output.length > 4096) return unavailable();
      if (!output.includes('\0') && !output.includes('\n')) return;
      const reply = output.replaceAll('\0', '').replaceAll('\r', '').replaceAll('\n', '');
      if (reply === 'stream: OK') complete();
      else if (/ FOUND$/.test(reply)) complete(new BadRequestException('CV failed the security scan. Upload a different file.'));
      else unavailable();
    });
  });
}

@Injectable()
export class CvSecurity {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}
  async validate(file: Express.Multer.File | undefined) {
    const cv = validateCv(file);
    const host = this.config.get<string>('CV_CLAMAV_HOST');
    if (host) {
      const port = Number(this.config.get('CV_CLAMAV_PORT') || 3310);
      if (!Number.isInteger(port) || port < 1 || port > 65535)
        throw new ServiceUnavailableException('CV scanner configuration is invalid');
      await scanClamAv(cv.bytes, host, port);
      return { ...cv, scanStatus: 'CLEAN' };
    }
    if (this.config.get('NODE_ENV') === 'production')
      throw new ServiceUnavailableException('CV uploads are temporarily unavailable');
    return { ...cv, scanStatus: 'DEVELOPMENT_UNSCANNED' };
  }
}
