import Link from 'next/link';
import { ArrowUpRight, Check, ClipboardCheck, Layers3, ShieldCheck } from 'lucide-react';
import {
  industryProfile,
  isPlaceholderPartner,
  showcaseCopy,
  type ShowcaseLocale,
} from '@/content/showcase';
import { ShowcaseArt, TechnologyOptions } from './showcase-cards';
import './showcase.css';
export function ShowcaseHero({
  locale,
  kind,
  title,
  intro,
}: {
  locale: ShowcaseLocale;
  kind: 'industry' | 'project' | 'blog' | 'resource';
  title: string;
  intro: string;
}) {
  return (
    <header className={`showcase-catalog-hero showcase-catalog-${kind}`}>
      <div className="showcase-container">
        <div>
          <p className="showcase-kicker">
            TEVONIQ /{' '}
            {kind === 'industry'
              ? 'BUSINESS CONTEXT'
              : kind === 'project'
                ? 'PROJECTS & CONCEPTS'
                : 'KNOWLEDGE'}
          </p>
          <h1>{title}</h1>
          <p>{intro}</p>
          <a className="showcase-heading-link" href="#showcase-content">
            {locale === 'ar' ? 'استكشف المحتوى' : 'Explore the content'}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <ShowcaseArt kind={kind} index={kind === 'industry' ? 0 : kind === 'project' ? 1 : 2} />
      </div>
    </header>
  );
}
export function IndustryPathways({ locale, slug }: { locale: ShowcaseLocale; slug: string }) {
  const p = industryProfile(slug),
    c = showcaseCopy[locale];
  return (
    <section className="showcase-industry-paths">
      <div className="showcase-container">
        <div className="showcase-two-grid">
          <article>
            <p className="showcase-kicker">01 / {c.sectorNeed}</p>
            <h2>{c.scope}</h2>
            <ul>
              {p[locale].needs.map((need) => (
                <li key={need}>
                  <Check size={17} aria-hidden="true" />
                  {need}
                </li>
              ))}
            </ul>
            <p>{p[locale].scope}</p>
          </article>
          <article>
            <p className="showcase-kicker">02 / {c.sectorDemo}</p>
            <h2>{c.sectorNext}</h2>
            <p>{c.sectorNextBody}</p>
            <div className="showcase-actions">
              <Link href={`/${locale}${p.demo}`}>
                {c.sectorDemo}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
              <Link href={`/${locale}/contact`}>
                {c.discuss}
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
export function TechnologyPartnersPage({
  locale,
  partners,
}: {
  locale: ShowcaseLocale;
  partners: { id: string; title: string; description: string }[];
}) {
  const c = showcaseCopy[locale],
    verified = partners.filter((p) => !isPlaceholderPartner(p.title));
  return (
    <div className="showcase-technology-page">
      <ShowcaseHero locale={locale} kind="project" title={c.partners} intro={c.partnerIntro} />
      <section id="showcase-content" className="showcase-section">
        <div className="showcase-container">
          <p className="showcase-kicker">{c.tools}</p>
          <h2>
            {locale === 'ar'
              ? 'كل أداة لها دور، وكل مشروع له متطلبات'
              : 'Every tool has a role. Every project has requirements.'}
          </h2>
          <p className="showcase-intro">{c.toolNote}</p>
          <TechnologyOptions locale={locale} />
        </div>
      </section>
      {verified.length > 0 && (
        <section className="showcase-section showcase-confirmed-partners">
          <div className="showcase-container">
            <p className="showcase-kicker">
              {locale === 'ar' ? 'علاقات مستقلة عن أمثلة الأدوات' : 'SEPARATE FROM TOOL EXAMPLES'}
            </p>
            <h2>{c.verified}</h2>
            <div className="showcase-three-grid">
              {verified.map((p) => (
                <article className="showcase-partner" key={p.id}>
                  <ShieldCheck size={29} aria-hidden="true" />
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="showcase-section showcase-selection">
        <div className="showcase-container">
          <h2>
            {locale === 'ar'
              ? 'كيف نختار التقنية لمشروعك؟'
              : 'How do we choose technology for your project?'}
          </h2>
          <div className="showcase-three-grid">
            {[
              [
                Layers3,
                locale === 'ar' ? 'ملاءمة الوظيفة' : 'Fit for the task',
                locale === 'ar'
                  ? 'نبدأ بالمستخدمين والخطوات والربط المطلوب، ثم نقيّم البدائل.'
                  : 'Start with users, workflows and required connections, then review alternatives.',
              ],
              [
                ClipboardCheck,
                locale === 'ar' ? 'تكلفة ومسؤوليات واضحة' : 'Clear costs and ownership',
                locale === 'ar'
                  ? 'نفصل التطوير عن الترخيص والتشغيل والتجديد، ونوضح مسؤولية الصيانة.'
                  : 'Separate development from licensing, operation and renewal, with explicit maintenance ownership.',
              ],
              [
                ShieldCheck,
                locale === 'ar' ? 'اختبار قبل الاعتماد' : 'Verify before selection',
                locale === 'ar'
                  ? 'نختبر النقاط المهمة ونراجع الوصول والتوافق قبل توسيع الاستخدام.'
                  : 'Check important behaviour, access and compatibility before wider use.',
              ],
            ].map(([Icon, title, body], i) => {
              const I = Icon as typeof Layers3;
              return (
                <article className="showcase-selection-card" key={i}>
                  <I size={29} aria-hidden="true" />
                  <h3>{title as string}</h3>
                  <p>{body as string}</p>
                </article>
              );
            })}
          </div>
          <Link className="showcase-heading-link" href={`/${locale}/contact`}>
            {locale === 'ar' ? 'ناقش خيارات مشروعك' : 'Discuss your project options'}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
