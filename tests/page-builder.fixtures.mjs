import { randomUUID } from 'node:crypto';
import { sectionTypes, emptySectionCopy } from '../packages/validation/dist/index.js';
export const media = { src: '/brand/icon.png', alt: 'TEVONIQ fixture icon', caption: '' };
export function makeSection(type, index = 0, ids = {}) {
  const copy = {
    ...emptySectionCopy(type),
    heading: `${type} fixture`,
    text: 'Structured content for a development test.',
  };
  if (type === 'Hero') copy.actions = [{ label: 'Contact us', href: '/contact' }];
  if (type === 'RichText')
    copy.nodes = [
      { type: 'paragraph', text: 'A paragraph with <script>literal text</script>.' },
      { type: 'heading', level: 'h3', text: 'A useful heading' },
      { type: 'list', ordered: false, items: ['First point', 'Second point'] },
      { type: 'quote', text: 'A fixture quotation.', attribution: 'Fixture author' },
      { type: 'link', label: 'Contact the team', href: '/contact' },
    ];
  if (type === 'ImageText') {
    copy.media = media;
    copy.action = { label: 'Request a quote', href: '/request-quote' };
  }
  if (type === 'FeatureGrid')
    copy.items = [
      { title: 'Structured', text: 'Content uses typed fields.' },
      { title: 'Reusable', text: 'Sections share renderers.' },
    ];
  const kind = {
    ServiceGrid: 'service',
    SolutionGrid: 'solution',
    IndustryGrid: 'industry',
    ProjectGrid: 'project',
  }[type];
  if (kind) copy.ids = [ids[kind] || randomUUID()];
  if (type === 'Stats')
    copy.items = [{ value: 'Example', label: 'Illustrative value', note: 'Test data only' }];
  if (type === 'LogoGrid') copy.items = [{ name: 'Fixture organization', media, href: '/contact' }];
  if (type === 'TeamGrid')
    copy.items = [{ name: 'Fixture person', role: 'Example role', bio: 'Test biography.', media }];
  if (type === 'Testimonials')
    copy.items = [
      { quote: 'A fixture quote.', author: 'Fixture person', company: 'Example company' },
    ];
  if (type === 'FAQ')
    copy.items = [
      { question: 'How does the builder work?', answer: 'Administrators compose typed sections.' },
    ];
  if (type === 'CTA') copy.action = { label: 'Start a conversation', href: '/contact' };
  if (type === 'ImageGallery') copy.images = [media, media];
  if (type === 'Video') {
    copy.videoId = 'dQw4w9WgXcQ';
    copy.transcript = 'A fixture video transcript.';
  }
  if (type === 'Timeline')
    copy.items = [
      {
        label: 'Example milestone',
        title: 'Review',
        text: 'A development fixture, not company history.',
      },
    ];
  if (type === 'ContactBlock') {
    copy.email = 'fixture@example.test';
    copy.phone = '+90 555 555 5555';
    copy.address = 'CMS-entered address';
    copy.action = { label: 'Send a message', href: '/contact' };
  }
  if (type === 'Newsletter') {
    copy.buttonLabel = 'Subscribe';
    copy.consentLabel = 'I agree to receive the newsletter.';
    copy.successMessage = 'Thank you for subscribing.';
  }
  return {
    id: randomUUID(),
    type,
    visible: true,
    order: index,
    theme: ['LIGHT', 'DARK', 'BLUE', 'GRADIENT'][index % 4],
    background: ['PLAIN', 'SOFT', 'GRID'][index % 3],
    spacing: 'NORMAL',
    content: { en: copy },
  };
}
export function makeDocument(path = '/builder-fixture', ids = {}) {
  return {
    schemaVersion: 1,
    path,
    translations: {
      en: {
        title: 'Page builder fixture',
        seoTitle: 'Page builder fixture | TEVONIQ',
        seoDescription: 'A structured page used for development verification.',
        ogImage: '',
      },
    },
    sections: sectionTypes.map((t, i) => makeSection(t, i, ids)),
  };
}
