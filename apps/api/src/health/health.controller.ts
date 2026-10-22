import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import type { HealthResponse } from '@tevoniq/types';
import { DatabaseService } from '../database/database.service.js';
@Controller('health')
export class HealthController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}
  @Get('live')
  live(): HealthResponse {
    return { status: 'ok', service: 'api' };
  }
  @Get('ready')
  async ready(): Promise<HealthResponse> {
    try {
      await this.database.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { status: 'ok', service: 'api' };
  }
}
