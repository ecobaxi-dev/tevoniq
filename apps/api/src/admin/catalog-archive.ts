import { ConflictException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
export async function archiveCatalog(
  tx: Prisma.TransactionClient,
  kind: 'service' | 'solution' | 'industry' | 'project',
  id: string,
  version: number,
  actorId: string,
) {
  const references =
    kind === 'service'
      ? await Promise.all([
          tx.solutionService.count({ where: { serviceId: id } }),
          tx.industryService.count({ where: { serviceId: id } }),
          tx.projectService.count({ where: { serviceId: id } }),
        ])
      : kind === 'solution'
        ? await Promise.all([
            tx.solutionIndustry.count({ where: { solutionId: id } }),
            tx.solutionProject.count({ where: { solutionId: id } }),
          ])
        : kind === 'industry'
          ? await Promise.all([
              tx.solutionIndustry.count({ where: { industryId: id } }),
              tx.industryProject.count({ where: { industryId: id } }),
            ])
          : await Promise.all([
              tx.solutionProject.count({ where: { projectId: id } }),
              tx.industryProject.count({ where: { projectId: id } }),
            ]);
  if (
    references.some(Boolean) ||
    (await tx.pageCatalogReference.count({ where: { [`${kind}Id`]: id } }))
  )
    throw new ConflictException(
      'This record is referenced by other content. Remove its references before archiving.',
    );
  const where = { id, version, deletedAt: null },
    data = { deletedAt: new Date(), updatedById: actorId, version: { increment: 1 } };
  const result =
    kind === 'service'
      ? await tx.service.updateMany({ where, data: { ...data, active: false } })
      : kind === 'solution'
        ? await tx.solution.updateMany({
            where,
            data: { ...data, active: false, published: false, status: 'DRAFT' },
          })
        : kind === 'industry'
          ? await tx.industry.updateMany({
              where,
              data: { ...data, active: false, published: false, status: 'DRAFT' },
            })
          : await tx.project.updateMany({ where, data: { ...data, published: false } });
  if (result.count !== 1) throw new ConflictException('Record changed. Reload before archiving.');
  await tx.cmsAudit.create({ data: { actorId, entityId: id, action: `${kind}.archive` } });
  return { ok: true };
}
