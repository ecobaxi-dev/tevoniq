import { conceptArt } from '@/config/concept-art';
import type { PublicSolution, ServiceBlock } from '@tevoniq/validation';
import { Container } from '@tevoniq/ui';
import { solutionExperience } from '@/content/solution-experience';
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
  const render = (block: ServiceBlock) => (
    <ContentBlocks
      art={conceptArt(solution.slug)}
      blocks={[block]}
      relatedServices={solution.services}
      relatedProjects={solution.projects}
      locale={solution.locale}
    />
  );
  const sectionFor = (id: string) => solution.blocks.find((b) => b.content.id === id)?.area;
  const visible = blocks
    .filter((b) => b.type !== 'related-services' || b.ids.length)
    .filter((b) => b.type !== 'related-projects' || b.ids.length);
  const navigation = visible.filter((b) =>
    [
      'solutionOverview',
      'capabilities',
      'includedServices',
      'implementationApproach',
      'relatedProjects',
      'faq',
    ].includes(sectionFor(b.id) || ''),
  );
  return (
    <>
      {visible
        .filter((b) => b.type === 'hero')
        .map((b) => (
          <div key={b.id}>{render(b)}</div>
        ))}
      {navigation.length > 0 && (
        <nav
          className="solution-section-nav"
          aria-label={solutionExperience[solution.locale].inSolution}
        >
          <Container>
            <p>{solutionExperience[solution.locale].inSolution}</p>
            <ul>
              {navigation.map((b) => (
                <li key={b.id}>
                  <a href={`#solution-${sectionFor(b.id)}`}>{b.title}</a>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
      <div className="solution-chapters">
        {visible
          .filter((b) => b.type !== 'hero')
          .map((b) => (
            <div key={b.id} id={`solution-${sectionFor(b.id)}`} className="solution-chapter">
              {render(b)}
            </div>
          ))}
      </div>
    </>
  );
}
