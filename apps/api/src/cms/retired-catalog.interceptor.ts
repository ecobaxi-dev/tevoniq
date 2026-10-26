import {
  Injectable,
  NotFoundException,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs';
import { isRetiredPublicPath, pruneRetiredCatalog } from '@tevoniq/types';

@Injectable()
export class RetiredCatalogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context
      .switchToHttp()
      .getRequest<{ method: string; path: string; query?: { path?: string } }>();
    const path = request.path.replace(/^\/api\/v1/, '');
    if (
      request.method !== 'GET' ||
      !/^\/(services|solutions|industries|projects|company|insights|careers|navigation|home|pages|seo|search|leads)(\/|$)/.test(
        path,
      )
    )
      return next.handle();
    if (
      isRetiredPublicPath(path) ||
      (path === '/pages/resolve' && request.query?.path && isRetiredPublicPath(request.query.path))
    )
      throw new NotFoundException();
    return next.handle().pipe(
      map((value: unknown) => {
        const result = pruneRetiredCatalog(value);
        if (result === undefined) throw new NotFoundException();
        return result;
      }),
    );
  }
}
