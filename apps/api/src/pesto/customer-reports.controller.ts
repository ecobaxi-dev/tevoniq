import {
  Controller,
  ForbiddenException,
  Get,
  Header,
  Inject,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import type { CmsRequest } from '../cms/cms.guard.js';
import { PestoCustomerReportsService } from './customer-reports.service.js';

@Controller('cms/pesto/customers')
export class CmsPestoCustomerReportsController {
  constructor(
    @Inject(PestoCustomerReportsService) private readonly reports: PestoCustomerReportsService,
  ) {}
  private companyAdmin(req: CmsRequest) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.cmsUser?.role))
      throw new ForbiddenException('Company administrator required.');
  }
  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Query() query: Record<string, unknown>, @Req() req: CmsRequest) {
    this.companyAdmin(req);
    return this.reports.list(query);
  }
  @Get(':kind/:id')
  @Header('Cache-Control', 'no-store')
  detail(@Param('kind') kind: string, @Param('id') id: string, @Req() req: CmsRequest) {
    this.companyAdmin(req);
    return this.reports.detail(kind, id);
  }
}
