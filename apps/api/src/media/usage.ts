import { hasPermission, moduleResource } from '@tevoniq/validation';
import type { Prisma } from '../generated/prisma/client.js';
/** Scan both snapshots and drafts, including archived content that can be restored. */
export async function mediaUsage(db: Prisma.TransactionClient, id: string, role?: string) {
  const path = '/media/' + id + '/';
  const groups = await Promise.all([
    db.insightArticle.findMany({
      select: { id: true, title: true, content: true, coverImage: true, ogImage: true },
    }),
    db.companyPage
      .findMany({ select: { slug: true, locale: true, content: true } })
      .then((rows) => rows.map((row) => ({ ...row, id: row.slug + ':' + row.locale }))),
    db.cmsPage.findMany({ select: { id: true, path: true, draft: true, published: true } }),
    db.serviceTranslation.findMany({ select: { id: true, title: true, blocks: true } }),
    db.solutionTranslation
      .findMany({ select: { id: true, name: true, blocks: true } })
      .then((rows) => rows.map((row) => ({ ...row, title: row.name }))),
    db.industryTranslation
      .findMany({ select: { id: true, name: true, blocks: true } })
      .then((rows) => rows.map((row) => ({ ...row, title: row.name }))),
    db.projectTranslation.findMany({
      select: { id: true, title: true, heroImage: true, gallery: true },
    }),
    db.adminRecord.findMany({ select: { id: true, module: true, title: true, data: true } }),
  ]);
  const kinds = [
    'Blog',
    'Company',
    'Pages',
    'Services',
    'Solutions',
    'Industries',
    'Projects',
    'Admin content',
  ];
  return groups.flatMap((rows, i) =>
    rows
      .filter((row) => {
        const resource =
          'module' in row
            ? moduleResource(row.module)
            : ['blog', 'pages', 'pages', 'services', 'solutions', 'industries', 'projects'][i];
        return (
          (!role || (!!resource && hasPermission(role, resource + '.read'))) &&
          JSON.stringify(row).includes(path)
        );
      })
      .map((row) => ({
        id: row.id,
        kind: kinds[i],
        title: 'title' in row ? row.title : 'path' in row ? row.path : row.slug,
      })),
  );
}
