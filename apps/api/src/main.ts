import type { Request, Response, NextFunction } from 'express';
import { SafeExceptionFilter } from './security/exception-filter.js';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bufferLogs: true,
  bodyParser: false,
});
app.useLogger(app.get(Logger));
app.use(helmet());
app.useGlobalFilters(new SafeExceptionFilter());
app.use('/api/v1/cms', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'private, no-store');
  next();
});
app.use(
  rateLimit({
    windowMs: 60000,
    limit: 120,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again shortly.' },
  }),
);
app.useBodyParser('json', { limit: '100kb' });
app.useBodyParser('urlencoded', { extended: false, limit: '100kb' });
app.setGlobalPrefix('api/v1');
app.enableCors({
  origin: app.get(ConfigService).getOrThrow<string>('CORS_ORIGIN'),
  credentials: true,
});
app.enableShutdownHooks();
await app.listen(
  app.get(ConfigService).getOrThrow<number>('PORT'),
  process.env.API_BIND_HOST === '127.0.0.1' ? '127.0.0.1' : '0.0.0.0',
);
