import { conceptArt } from '@/config/concept-art';
import type { PublicSolution, ServiceBlock } from '@tevoniq/validation';
import { ContentBlocks } from './content-blocks';

export function SolutionBlocks({ solution }: { solution: PublicSolution }) {
  const blocks: ServiceBlock[] = solution.blocks.flatMap(({ area, content }): ServiceBlock[] => {
    if (area === 'includedServices')
      return [
        {
          id: content.id,
          title: content.title,
          type: 'related-services',
          ids: solution.services.map((s) => s.id),
        },
      ];
    if (area === 'relatedProjects')
      return [
        {
          id: content.id,
          title: content.title,
          type: 'related-projects',
          ids: solution.projects.map((p) => p.id),
        },
      ];
    if (area === 'industries')
      return solution.industries.length
        ? [
            {
              id: content.id,
              title: content.title,
              type: 'industries',
              items: solution.industries.map((i) => ({ title: i.title, description: i.summary })),
            },
          ]
        : [];
    return [content];
  });
  return (
    <ContentBlocks
      art={conceptArt(solution.slug)}
      blocks={blocks}
      relatedServices={solution.services}
      relatedProjects={solution.projects}
      locale={solution.locale}
    />
  );
}
