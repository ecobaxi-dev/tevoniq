import {
  type ArgumentsHost,
  Catch,
  HttpException,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
@Catch()
export class SafeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SafeExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    if (status >= 500) this.logger.error({ event: 'request.failed', status });
    if (response.headersSent) return response.end();
    response
      .status(status)
      .json(
        status >= 500
          ? { statusCode: status, message: 'Service temporarily unavailable' }
          : exception instanceof HttpException
            ? exception.getResponse()
            : { message: 'Request failed' },
      );
  }
}
