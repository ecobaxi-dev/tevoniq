import { mlCopy } from '@/content/machine-learning';
import { qaCopy } from '@/content/qa-automation';
import { customCopy } from '@/content/custom-software';
import { iotCopy } from '@/content/iot-service';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Search,
  Check,
  ArrowUp,
  Compass,
  Workflow,
  CodeXml,
  Layers3,
} from 'lucide-react';
import {
  directoryCopy,
  directoryGroupCopy,
  directoryPaths,
  type DirectoryLocale,
} from '@/content/service-directory';
import { navigationVisuals } from '@/content/navigation-visuals';
import { consultingCopy } from '@/content/technology-consulting';
import { automationServiceCopy } from '@/content/intelligent-automation';
import { erpCopy } from '@/content/erp-service';
import { engineeringCopy } from '@/content/software-engineering';
import {
  groupServiceDirectory,
  type DirectoryCard,
  type DirectoryNavigationGroup,
} from '@/lib/service-directory';
import { serviceLabels } from '@/content/services';
import './service-directory.css';
const summaries = {
  'ai-machine-learning': mlCopy,
  'qa-automation': qaCopy,
  'custom-software-development': customCopy,
  'iot-solutions': iotCopy,
  'it-consulting': consultingCopy,
  'business-automation': automationServiceCopy,
  'erp-solutions': erpCopy,
  'software-product-engineering': engineeringCopy,
};
export function ServiceDirectory({
  locale,
  result,
  q,
  navigation,
}: {
  locale: DirectoryLocale;
  result: { items: DirectoryCard[]; total: number; page: number; limit: number } | undefined;
  q: string;
  navigation: DirectoryNavigationGroup[];
}) {
  const ar = locale === 'ar',
    c = directoryCopy[locale],
    labels = serviceLabels[locale];
  const groups = groupServiceDirectory(result?.items ?? [], navigation, c.fallback);
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);
  const pageHref = (page: number) =>
    `/${locale}/services?${new URLSearchParams({ page: String(page), q })}`;
  return (
    <main id="main-content" className="services-page sd-directory" dir={ar ? 'rtl' : 'ltr'}>
      <section className="sd-hero-shell">
        <div className="sd-section sd-hero">
          <div>
            <p className="sd-eyebrow">{c.eyebrow}</p>
            <h1>{c.title}</h1>
            <p className="sd-lead">{c.intro}</p>
            <div className="sd-actions">
              <a className="sd-primary" href="#service-directory">
                {c.explore}
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
              <Link className="sd-secondary" href={`/${locale}/contact?intent=quote`}>
                {c.talk}
              </Link>
            </div>
            <ul className="sd-points">
              {(ar
                ? ['تواصل مباشر', 'نطاق واضح', 'تنفيذ على مراحل']
                : ['Direct communication', 'Clear scope', 'Staged delivery']
              ).map((line) => (
                <li key={line}>
                  <Check size={16} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="sd-hero-art">
            <Image
              src="/brand/navigation/solutions-v1.webp"
              alt=""
              width={560}
              height={373}
              unoptimized
              loading="eager"
            />
            <div>
              <span>TEVONIQ / DIGITAL SERVICES</span>
              <strong>
                {ar
                  ? 'مواقع · أنظمة · أتمتة · معلومات'
                  : 'WEBSITES · SYSTEMS · AUTOMATION · DASHBOARDS'}
              </strong>
            </div>
          </div>
        </div>
      </section>
      <section className="sd-section sd-start">
        <header className="sd-heading">
          <p className="sd-eyebrow">
            {ar ? 'نماذج توضيحية يمكنك تجربتها' : 'ILLUSTRATIVE DEMOS YOU CAN TRY'}
          </p>
          <h2>{c.modelsTitle}</h2>
          <p>{c.modelsIntro}</p>
        </header>
        <div className="sd-paths">
          {directoryPaths.map((path) => (
            <Link
              href={`/${locale}/${path.href}`}
              className={`sd-path sd-path-${path.theme}`}
              key={path.id}
            >
              <div className="sd-path-image">
                <Image
                  src={ar ? path.image : path.enImage}
                  alt=""
                  width={560}
                  height={373}
                  unoptimized
                  loading="lazy"
                />
              </div>
              <div>
                <h3>{path[locale].title}</h3>
                <p>{path[locale].body}</p>
                <span>
                  {path[locale].cta}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section id="service-directory" className="sd-catalog-shell">
        <div className="sd-section">
          <header className="sd-heading">
            <p className="sd-eyebrow">{ar ? 'دليل الخدمات' : 'SERVICE DIRECTORY'}</p>
            <h2>{c.catalogTitle}</h2>
            <p>{c.catalogIntro}</p>
          </header>
          <form className="sd-search services-search" method="get" action={`/${locale}/services`}>
            <label htmlFor="services-search">{labels.search}</label>
            <div>
              <Search size={19} aria-hidden="true" />
              <input
                id="services-search"
                name="q"
                maxLength={120}
                defaultValue={q}
                placeholder={
                  ar ? 'ابحث باسم الخدمة أو احتياجك' : 'Search by service or business need'
                }
              />
              <button type="submit" className="sd-primary">
                {labels.search}
              </button>
            </div>
            {q && (
              <Link className="sd-clear" href={`/${locale}/services#service-directory`}>
                {c.clear}
              </Link>
            )}
          </form>
          {!result ? (
            <div className="sd-status">
              <p role="status">{labels.error}</p>
              <Link href={`/${locale}/services`}>{ar ? 'إعادة المحاولة' : 'Try again'}</Link>
            </div>
          ) : !count ? (
            <div className="sd-status">
              <p role="status">{q ? c.emptySearch : labels.empty}</p>
              {q && <Link href={`/${locale}/services`}>{c.clear}</Link>}
            </div>
          ) : (
            <>
              <nav className="sd-category-nav" aria-label={c.categories}>
                {groups.map((group) => (
                  <a key={group.id} href={`#service-group-${group.id}`}>
                    <span>{group.label}</span>
                    <small>{group.items.length}</small>
                  </a>
                ))}
              </nav>
              <p className="sd-result-count">
                {c.results}: {count}
              </p>
              {groups.map((group) => {
                const visual = Object.hasOwn(navigationVisuals, group.id)
                  ? navigationVisuals[group.id as keyof typeof navigationVisuals]
                  : navigationVisuals.additional;
                return (
                  <section
                    id={`service-group-${group.id}`}
                    className="sd-service-group"
                    key={group.id}
                  >
                    <header className="sd-group-heading">
                      <div>
                        <p className="sd-eyebrow">{ar ? 'خدمات منشورة' : 'PUBLISHED SERVICES'}</p>
                        <h2>{group.label}</h2>
                        {directoryGroupCopy[group.id] && (
                          <p>{directoryGroupCopy[group.id]![locale]}</p>
                        )}
                      </div>
                      <Image
                        src={visual.src}
                        alt=""
                        width={560}
                        height={373}
                        unoptimized
                        loading="lazy"
                      />
                    </header>
                    <div className="services-grid sd-services-grid">
                      {group.items.map((item) => {
                        const copy = Object.hasOwn(summaries, item.slug)
                          ? summaries[item.slug as keyof typeof summaries][locale]
                          : undefined;
                        const Icon =
                          item.slug === 'it-consulting'
                            ? Compass
                            : item.slug === 'business-automation'
                              ? Workflow
                              : item.slug === 'software-product-engineering'
                                ? CodeXml
                                : Layers3;
                        return (
                          <article className="tv-card sd-service-card" key={item.slug}>
                            <span className="sd-card-icon">
                              <Icon size={23} aria-hidden="true" />
                            </span>
                            <h3>
                              <Link href={`/${locale}/services/${item.slug}`}>{item.title}</Link>
                            </h3>
                            <p>{copy?.seoDescription ?? item.summary}</p>
                            {copy && (
                              <span className="sd-card-note">
                                <Check size={15} aria-hidden="true" />
                                {ar
                                  ? 'مراحل ومخرجات وأمثلة داخل الخدمة'
                                  : 'Stages, outputs and examples inside'}
                              </span>
                            )}
                            <Link
                              className="sd-service-link"
                              href={`/${locale}/services/${item.slug}`}
                              aria-label={`${c.details}: ${item.title}`}
                            >
                              {c.details}
                              <ArrowUpRight size={17} aria-hidden="true" />
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
              {result.total > result.limit && (
                <nav
                  className="services-pagination sd-pagination"
                  aria-label={ar ? 'صفحات الخدمات' : 'Service pages'}
                >
                  {result.page > 1 && (
                    <Link className="sd-secondary" href={pageHref(result.page - 1)}>
                      {labels.previous}
                    </Link>
                  )}
                  <span>
                    {result.page} / {Math.ceil(result.total / result.limit)}
                  </span>
                  {result.page * result.limit < result.total && (
                    <Link className="sd-primary" href={pageHref(result.page + 1)}>
                      {labels.next}
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
      <section className="sd-section">
        <div className="sd-contact">
          <div>
            <p className="sd-eyebrow">
              {ar ? 'ابدأ من عملك اليومي' : 'START WITH YOUR EVERYDAY WORK'}
            </p>
            <h2>{c.contactTitle}</h2>
            <p>{c.contactBody}</p>
          </div>
          <Link className="sd-primary" href={`/${locale}/contact?intent=quote`}>
            {c.contactCta}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <a className="sd-back" href="#service-directory">
          {c.backTop}
          <ArrowUp size={16} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}
