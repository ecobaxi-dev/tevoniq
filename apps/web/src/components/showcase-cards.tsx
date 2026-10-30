import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  ClipboardList,
  Factory,
  FileText,
  GraduationCap,
  Layers3,
  Monitor,
  ShoppingBag,
  Stethoscope,
  Truck,
  Utensils,
} from 'lucide-react';
import {
  industryProfile,
  isIllustrativeProject,
  showcaseCopy,
  technologyOptions,
  type ShowcaseLocale,
} from '@/content/showcase';
import type { HomeRecord, HomeCollections } from '@/content/home-records';
import './showcase.css';
const icons = {
  shop: ShoppingBag,
  hospitality: Utensils,
  factory: Factory,
  building: Building2,
  education: GraduationCap,
  care: Stethoscope,
  delivery: Truck,
};
export function ShowcaseArt({ kind = 'project', index = 0 }: { kind?: string; index?: number }) {
  const Icon =
    kind === 'industry'
      ? Building2
      : kind === 'resource'
        ? ClipboardList
        : kind === 'blog'
          ? BookOpen
          : kind === 'case-study'
            ? FileText
            : Monitor;
  return (
    <div className={`showcase-art showcase-tone-${index % 4}`} aria-hidden="true">
      <span>
        TEVONIQ / {kind === 'industry' ? 'BUSINESS' : kind === 'project' ? 'CONCEPT' : 'KNOWLEDGE'}
      </span>
      <div className="showcase-window">
        <div>
          <i />
          <i />
          <i />
        </div>
        <section>
          <Icon size={35} />
          <span>
            <i />
            <i />
            <i />
          </span>
        </section>
        <footer>
          <i />
          <i />
          <i />
          <i />
        </footer>
      </div>
    </div>
  );
}
export function IndustryShowcaseCard({
  item,
  locale,
  index = 0,
}: {
  item: Pick<HomeRecord, 'id' | 'title' | 'description' | 'href' | 'slug'>;
  locale: ShowcaseLocale;
  index?: number;
}) {
  const p = industryProfile(item.slug ?? item.href.split('/').at(-1) ?? ''),
    Icon = icons[p.icon as keyof typeof icons] ?? Building2,
    c = showcaseCopy[locale];
  return (
    <article className={`showcase-sector showcase-sector-${p.tone}`}>
      <div className="showcase-sector-top">
        <Icon size={30} aria-hidden="true" />
        <span>0{index + 1}</span>
      </div>
      <h3>
        <Link href={`/${locale}${item.href}`}>{item.title}</Link>
      </h3>
      <p>{item.description}</p>
      <ul>
        {p[locale].needs.map((need) => (
          <li key={need}>
            <Check size={14} aria-hidden="true" />
            {need}
          </li>
        ))}
      </ul>
      <Link className="showcase-card-link" href={`/${locale}${item.href}`}>
        {c.view}
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </article>
  );
}
export function ProjectShowcaseCard({
  item,
  locale,
  index = 0,
}: {
  item: HomeRecord;
  locale: ShowcaseLocale;
  index?: number;
}) {
  const c = showcaseCopy[locale],
    demo = isIllustrativeProject(item.slug ?? item.href.split('/').at(-1) ?? '');
  return (
    <article className="showcase-project">
      <Link href={`/${locale}${item.href}`} className="showcase-media" aria-label={item.title}>
        {item.image ? (
          <Image
            unoptimized
            src={item.image}
            alt={item.imageAlt || item.title}
            width={800}
            height={500}
          />
        ) : (
          <ShowcaseArt index={index} />
        )}
        <span className="showcase-media-tag">{demo ? c.demo : c.published}</span>
      </Link>
      <div className="showcase-card-body">
        <h3>
          <Link href={`/${locale}${item.href}`}>{item.title}</Link>
        </h3>
        <p>{item.description}</p>
        <Link className="showcase-card-link" href={`/${locale}${item.href}`}>
          {c.view}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
export function InsightShowcaseCard({
  item,
  locale,
  index = 0,
}: {
  item: HomeRecord;
  locale: ShowcaseLocale;
  index?: number;
}) {
  const c = showcaseCopy[locale],
    type = item.kind === 'resource' ? c.resource : item.kind === 'case-study' ? c.case : c.blog;
  return (
    <article className="showcase-insight">
      <Link className="showcase-media" href={`/${locale}${item.href}`} aria-label={item.title}>
        {item.image ? (
          <Image
            unoptimized
            src={item.image}
            alt={item.imageAlt || item.title}
            width={800}
            height={500}
          />
        ) : (
          <ShowcaseArt kind={item.kind ?? 'blog'} index={index} />
        )}
      </Link>
      <div className="showcase-card-body">
        <div className="showcase-insight-meta">
          <span>{type}</span>
          {item.readingTime ? (
            <span>
              {item.readingTime} {c.minutes}
            </span>
          ) : null}
        </div>
        <h3>
          <Link href={`/${locale}${item.href}`}>{item.title}</Link>
        </h3>
        <p>{item.description}</p>
        {item.publishedAt && (
          <time dateTime={item.publishedAt}>
            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
              new Date(item.publishedAt),
            )}
          </time>
        )}
        <Link className="showcase-card-link" href={`/${locale}${item.href}`}>
          {locale === 'ar' ? 'اقرأ المحتوى' : 'Read the content'}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
export function TechnologyOptions({
  locale,
  compact = false,
  linked = true,
}: {
  locale: ShowcaseLocale;
  compact?: boolean;
  linked?: boolean;
}) {
  const items = compact ? technologyOptions.slice(0, 4) : technologyOptions;
  return (
    <div className="showcase-tech-grid">
      {items.map((item) => (
        <article
          className="showcase-tech"
          key={item.id}
          id={compact ? undefined : `technology-${item.id}`}
        >
          <span className="showcase-tech-mark" aria-hidden="true">
            {item.mark}
          </span>
          <div>
            <p className="showcase-tech-name" dir="ltr">
              {item.name}
            </p>
            <h3>{item[locale][0]}</h3>
            <p>{item[locale][1]}</p>
            {compact && linked && (
              <Link href={`/${locale}/company/partners#technology-${item.id}`}>
                {locale === 'ar' ? 'تعرف على دورها' : 'Explore its role'}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
export function HomeShowcases({
  locale,
  collections,
  partnersAvailable = true,
}: {
  locale: ShowcaseLocale;
  collections: HomeCollections;
  partnersAvailable?: boolean;
}) {
  const c = showcaseCopy[locale],
    rank = ['smes', 'retail', 'hospitality', 'manufacturing', 'real-estate', 'logistics'];
  const sectors = [...collections.industries]
    .sort((a, b) => {
      const ai = rank.indexOf(a.slug ?? ''),
        bi = rank.indexOf(b.slug ?? '');
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    })
    .slice(0, 6);
  return (
    <div className="home-showcases">
      <section id="industries" className="showcase-section showcase-home-industries">
        <div className="showcase-container">
          <ShowcaseHeading
            index="01"
            eyebrow={locale === 'ar' ? 'القطاعات التي نخدمها' : 'INDUSTRIES WE CAN SUPPORT'}
            title={c.industries}
            intro={c.industryIntro}
            href={`/${locale}/industries`}
            action={c.allIndustries}
          />
          {sectors.length ? (
            <div className="showcase-sectors">
              {sectors.map((item, i) => (
                <IndustryShowcaseCard item={item} key={item.id} locale={locale} index={i} />
              ))}
            </div>
          ) : (
            <p role="status" className="showcase-empty">
              {c.empty}
            </p>
          )}
        </div>
      </section>
      <section id="projects" className="showcase-section showcase-home-projects">
        <div className="showcase-container">
          <ShowcaseHeading
            index="02"
            eyebrow={locale === 'ar' ? 'مشاريع ونماذج مميزة' : 'FEATURED PROJECTS & CONCEPTS'}
            title={c.projects}
            intro={c.projectIntro}
            href={`/${locale}/projects`}
            action={c.allProjects}
          />
          {collections.projects.length ? (
            <div className="showcase-three-grid">
              {collections.projects.map((item, i) => (
                <ProjectShowcaseCard key={item.id} item={item} locale={locale} index={i} />
              ))}
            </div>
          ) : (
            <p role="status" className="showcase-empty">
              {c.empty}
            </p>
          )}
          <div className="showcase-practical-link">
            <Layers3 size={23} aria-hidden="true" />
            <span>
              {locale === 'ar'
                ? 'تريد تجربة واجهة تعمل أمامك؟'
                : 'Want to try an interactive example?'}
            </span>
            <Link href={`/${locale}/work-systems`}>
              {locale === 'ar' ? 'جرّب نماذج أنظمة العمل' : 'Try the work system demos'}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section id="partners" className="showcase-section showcase-home-tech">
        <div className="showcase-container">
          <ShowcaseHeading
            index="03"
            eyebrow={locale === 'ar' ? 'منظومة التقنية' : 'TECHNOLOGY ECOSYSTEM'}
            title={c.partners}
            intro={c.partnerIntro}
            href={partnersAvailable ? `/${locale}/company/partners` : undefined}
            action={c.allPartners}
          />
          <TechnologyOptions locale={locale} compact linked={partnersAvailable} />
          {collections.partners.length > 0 && (
            <div className="showcase-verified">
              <h3>{c.verified}</h3>
              {collections.partners.map((item) => (
                <p key={item.id}>
                  <strong>{item.title}</strong> — {item.description}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>
      <section id="insights" className="showcase-section showcase-home-insights">
        <div className="showcase-container">
          <ShowcaseHeading
            index="04"
            eyebrow={locale === 'ar' ? 'أحدث المقالات والموارد' : 'LATEST ARTICLES & RESOURCES'}
            title={c.insights}
            intro={c.insightIntro}
            href={`/${locale}/insights`}
            action={c.allInsights}
          />
          <nav className="showcase-pills" aria-label={c.allInsights}>
            <Link href={`/${locale}/insights/blog`}>{c.blog}</Link>
            <Link href={`/${locale}/insights/resources`}>{c.resource}</Link>
            <Link href={`/${locale}/insights/case-studies`}>{c.case}</Link>
          </nav>
          {collections.insights.length ? (
            <div className="showcase-three-grid">
              {collections.insights.map((item, i) => (
                <InsightShowcaseCard key={item.id} item={item} locale={locale} index={i} />
              ))}
            </div>
          ) : (
            <p role="status" className="showcase-empty">
              {c.empty}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
export function ShowcaseHeading({
  index,
  eyebrow,
  title,
  intro,
  href,
  action,
}: {
  index: string;
  eyebrow: string;
  title: string;
  intro: string;
  href?: string | undefined;
  action?: string;
}) {
  return (
    <div className="showcase-heading">
      <div>
        <p className="showcase-kicker">
          <span>{index}</span>
          {eyebrow}
        </p>
        <h2>{title}</h2>
        <p>{intro}</p>
      </div>
      {href && (
        <Link className="showcase-heading-link" href={href}>
          {action}
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
