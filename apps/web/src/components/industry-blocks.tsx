import type { PublicIndustry } from '@tevoniq/validation';
import { Container, Section, Card } from '@tevoniq/ui';
import { ContentBlocks } from './content-blocks';

export function IndustryBlocks({ industry }: { industry: PublicIndustry }) {
  return industry.blocks.map(({ area, content }) => {
    if (area === 'relevantSolutions') {
      if (!industry.solutions.length) return null;
      return (
        <Section key={content.id}>
          <Container>
            <h2 className="tv-h2">{content.title}</h2>
            <div className="services-grid">
              {industry.solutions.map((solution) => (
                <Card key={solution.id}>
                  <h3 className="tv-h3">
                    <a href={`/${industry.locale}/solutions/${solution.slug}`}>{solution.title}</a>
                  </h3>
                  <p className="tv-description">{solution.summary}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      );
    }
    const block =
      area === 'relevantServices'
        ? {
            id: content.id,
            title: content.title,
            type: 'related-services' as const,
            ids: industry.services.map((s) => s.id),
          }
        : area === 'projects'
          ? {
              id: content.id,
              title: content.title,
              type: 'related-projects' as const,
              ids: industry.projects.map((p) => p.id),
            }
          : content;
    return (
      <ContentBlocks
        key={content.id}
        blocks={[block]}
        relatedServices={industry.services}
        relatedProjects={industry.projects}
        locale={industry.locale}
      />
    );
  });
}
