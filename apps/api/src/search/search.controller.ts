import { Controller, Get, Inject, Query } from '@nestjs/common';
import { z } from 'zod';
import { parse } from '../cms/content-policy.js';
import { SearchProvider } from './search.provider.js';
export const searchQuerySchema = z.object({
  q: z.string().trim().max(200).default(''),
  locale: z.enum(['en', 'tr', 'ar']).default('en'),
  limit: z.coerce.number().int().min(1).max(50).default(8),
});
@Controller('search')
export class SearchController {
  constructor(@Inject(SearchProvider) private readonly provider: SearchProvider) {}
  @Get()
  search(@Query() raw: unknown) {
    return this.provider.search(parse(searchQuerySchema, raw));
  }
}
