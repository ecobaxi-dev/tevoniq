import { conceptArt } from '@/config/concept-art';
import type { PublicService } from '@tevoniq/validation';
import type { Locale } from '@tevoniq/types';
import { ContentBlocks } from './content-blocks';
import { UiUxService } from './ui-ux-service';
import { MobileService } from './mobile-service';
import { AiDevelopmentService } from './ai-development-service';
export function ServiceBlocks({ service, locale }: { service: PublicService; locale: Locale }) {
  if (service.slug === 'ai-augmented-development')
    return <AiDevelopmentService service={service} locale={locale} />;
  if (service.slug === 'ui-ux-design') return <UiUxService service={service} locale={locale} />;
  if (service.slug === 'mobile-application-development')
    return <MobileService service={service} locale={locale} />;
  return (
    <ContentBlocks
      art={conceptArt(service.slug)}
      blocks={service.blocks}
      relatedServices={service.relatedServices}
      relatedProjects={service.relatedProjects}
      locale={locale}
    />
  );
}
