import { isPlaceholderPartner } from './showcase.ts';
export type HomeRecord = {
  id: string;
  title: string;
  description: string;
  href: string;
  published: boolean;
  featured?: boolean;
  verified?: boolean;
  publishedAt?: string;
  slug?: string;
  image?: string | undefined;
  imageAlt?: string | undefined;
  kind?: 'blog' | 'resource' | 'case-study';
  readingTime?: number;
};
export type HomeCollections = {
  industries: HomeRecord[];
  projects: HomeRecord[];
  partners: HomeRecord[];
  insights: HomeRecord[];
};
export function selectHomeCollections(records: HomeCollections): HomeCollections {
  const published = (items: HomeRecord[]) =>
    items.filter((item) => item.published && /^\/(?!\/)[a-z0-9/-]*$/i.test(item.href));
  return {
    industries: published(records.industries),
    projects: published(records.projects)
      .filter((item) => item.featured === true)
      .slice(0, 3),
    partners: published(records.partners).filter(
      (item) => item.verified === true && !isPlaceholderPartner(item.title),
    ),
    insights: published(records.insights)
      .filter(
        (item) =>
          item.publishedAt &&
          Number.isFinite(Date.parse(item.publishedAt)) &&
          Date.parse(item.publishedAt) <= Date.now(),
      )
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))
      .slice(0, 3),
  };
}
