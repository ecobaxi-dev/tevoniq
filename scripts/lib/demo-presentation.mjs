import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { demoLabels } from '../../content/demo-content.mjs';
import { contentId } from './demo-content.mjs';

const externalReference = /\bn[\s-]?i[\s-]?x\b/i;
const prefix = /^(?:Demo|Örnek|نموذج تجريبي)\s*:\s*/u;
const strip = (text) => text.replace(prefix, '');
const actor = 'content-import:demo-presentation:v2';

export function projectPresentationPatch(before, desired) {
  const l = demoLabels[before.locale];
  const patch = {};
  for (const field of ['title', 'seoTitle', 'seoDescription']) {
    const clean = externalReference.test(before[field]) ? desired[field] : strip(before[field]);
    if (clean !== before[field]) patch[field] = clean;
  }
  for (const field of ['summary', 'solution', 'challenge']) {
    const clean = externalReference.test(before[field])
      ? desired[field]
      : before[field].replace(`${l.notice} `, '');
    if (clean !== before[field]) patch[field] = clean;
  }
  if (externalReference.test(before.implementation)) {
    patch.implementation =
      before.implementation
        .split(/\n\n/)
        .filter((p) => !externalReference.test(p))
        .join('\n\n') || desired.implementation;
  }
  if (before.heroImage) {
    const image = {
      ...before.heroImage,
      alt: strip(before.heroImage.alt),
      caption: before.heroImage.caption === l.notice ? l.demo : before.heroImage.caption,
    };
    if (!isDeepStrictEqual(image, before.heroImage)) patch.heroImage = image;
  }
  const results = before.results.filter((r) => r.value !== l.demo);
  if (!isDeepStrictEqual(results, before.results)) patch.results = results;
  return patch;
}

export function articlePresentationPatch(before, desired) {
  const l = demoLabels[before.language],
    patch = {};
  for (const field of ['title', 'seoTitle', 'seoDescription', 'coverImageAlt']) {
    const clean = externalReference.test(before[field]) ? desired[field] : strip(before[field]);
    if (clean !== before[field]) patch[field] = clean;
  }
  const excerpt = externalReference.test(before.excerpt)
    ? desired.excerpt
    : before.excerpt.replace(`${l.articleNote} `, '');
  if (excerpt !== before.excerpt) patch.excerpt = excerpt;
  const content = before.content.flatMap((block) => {
    if (block.type === 'link' && externalReference.test(block.url)) return [];
    if ('text' in block && [l.notice, l.articleNote, l.reference].includes(block.text)) return [];
    if (block.type === 'paragraph' && externalReference.test(block.text))
      return [{ ...block, text: desired.excerpt }];
    if (block.type === 'heading' && block.text === l.referenceSummary)
      return [{ ...block, text: l.scope }];
    return [block];
  });
  content.push({ type: 'paragraph', text: l.articleNote });
  if (!isDeepStrictEqual(content, before.content)) patch.content = content;
  return patch;
}

export async function refreshDemoPresentation(db, content, { apply, preview }) {
  const markerId = contentId('presentation:2026-10-25-v2');
  if (preview && (await db.adminRecord.findUnique({ where: { id: markerId } }))) return;
  const [projects, articles] = await Promise.all([
    db.project.findMany({
      where: { id: { in: content.projects.map((p) => p.id) } },
      include: { translations: true },
    }),
    db.insightArticle.findMany({ where: { id: { in: content.articles.map((p) => p.id) } } }),
  ]);
  const projectChanges = projects.flatMap((project) =>
    project.translations.flatMap((before) => {
      const desired = content.projects
        .find((p) => p.id === project.id)
        .value.translations.find((t) => t.locale === before.locale);
      const patch = projectPresentationPatch(before, desired);
      return Object.keys(patch).length ? [{ project, before, patch }] : [];
    }),
  );
  const articleChanges = articles.flatMap((before) => {
    const patch = articlePresentationPatch(
      before,
      content.articles.find((p) => p.id === before.id).value,
    );
    return Object.keys(patch).length ? [{ before, patch }] : [];
  });
  console.log(
    JSON.stringify({
      presentationRevision: 'v2',
      projectTranslations: projectChanges.length,
      articles: articleChanges.length,
      apply,
    }),
  );
  if (!apply || (!projectChanges.length && !articleChanges.length && !preview)) return;
  await mkdir('.data/content-backups', { recursive: true });
  await writeFile(
    `.data/content-backups/demo-presentation-${randomUUID()}.json`,
    JSON.stringify({ projectChanges, articleChanges }, null, 2),
    { flag: 'wx', mode: 0o600 },
  );
  await db.$transaction(
    async (tx) => {
      for (const { before, patch } of projectChanges) {
        const result = await tx.projectTranslation.updateMany({
          where: { id: before.id, updatedAt: before.updatedAt },
          data: patch,
        });
        if (result.count !== 1) throw new Error('Project changed during presentation update');
      }
      for (const project of new Map(
        projectChanges.map((r) => [r.project.id, r.project]),
      ).values()) {
        const result = await tx.project.updateMany({
          where: { id: project.id, version: project.version, updatedAt: project.updatedAt },
          data: { version: { increment: 1 } },
        });
        if (result.count !== 1) throw new Error('Project changed during presentation update');
        await tx.cmsAudit.create({
          data: { actorId: actor, entityId: project.id, action: 'demo.presentation.v2' },
        });
      }
      for (const { before, patch } of articleChanges) {
        const result = await tx.insightArticle.updateMany({
          where: { id: before.id, version: before.version, updatedAt: before.updatedAt },
          data: { ...patch, version: { increment: 1 } },
        });
        if (result.count !== 1) throw new Error('Article changed during presentation update');
        await tx.cmsAudit.create({
          data: { actorId: actor, entityId: before.id, action: 'demo.presentation.v2' },
        });
      }
      if (preview)
        await tx.adminRecord.create({
          data: {
            id: markerId,
            module: 'demo-release',
            title: 'demo-presentation/v2',
            language: 'en',
            status: 'published',
            data: { revision: 2 },
            createdById: actor,
            updatedById: actor,
          },
        });
    },
    { isolationLevel: 'Serializable', timeout: 60000 },
  );
}
