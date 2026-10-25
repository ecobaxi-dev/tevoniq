import { Heading } from '@tevoniq/ui';
import { StructuredData } from '@/components/seo/json-ld';
import { getOrganization } from '@/lib/seo';
import { jobPostingData } from '@/lib/seo-core';
import { env } from '@/lib/env';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { localeSchema, jobSlugSchema, isDemoJob } from '@tevoniq/validation';
import { getCareerJob } from '@/lib/careers';
import { careersCopy, careerLabel } from '@/content/careers';
import { ApplicationForm } from '@/components/careers/application-form';
import '../careers.css';
type Props = { params: Promise<{ locale: string; slug: string }> };
async function baseMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!localeSchema.safeParse(locale).success || !jobSlugSchema.safeParse(slug).success) return {};
  const job = await getCareerJob(slug);
  return job
    ? {
        title: `${job.title} | TEVONIQ Careers`,
        description: job.description.slice(0, 160),
        alternates: { canonical: `/${locale}/careers/${slug}` },
        robots: { index: !isDemoJob(slug), follow: true },
      }
    : { robots: { index: false } };
}
async function PublicPage({ params }: Props) {
  const raw = await params,
    locale = localeSchema.safeParse(raw.locale),
    slug = jobSlugSchema.safeParse(raw.slug);
  if (!locale.success || !slug.success) notFound();
  const job = await getCareerJob(slug.data);
  if (!job) notFound();
  const copy = careersCopy[locale.data];
  const demo = isDemoJob(job.slug);
  const organization = await getOrganization().catch(() => null);
  return (
    <main id="main-content" className="careers-page">
      <StructuredData
        data={
          !demo && organization
            ? jobPostingData(job, organization, env.SITE_URL, locale.data)
            : null
        }
      />
      <header className="careers-hero">
        <div className="careers-container">
          <a href={`/${locale.data}/careers`}>{copy.openings}</a>
          <p>{job.department}</p>
          <Heading as="h1">{job.title}</Heading>
          <p>
            {job.location} · {careerLabel(job.employmentType)} · {careerLabel(job.workMode)}
          </p>
          {!demo && (
            <a className="career-apply-link" href="#apply">
              {copy.apply}
            </a>
          )}
        </div>
      </header>
      <div className="careers-container careers-body">
        <article className="career-description">
          <p>{job.description}</p>
          {(['responsibilities', 'requirements', 'preferredQualifications'] as const).map(
            (key) =>
              !!job[key].length && (
                <section key={key}>
                  <Heading as="h2">
                    {copy[key === 'preferredQualifications' ? 'preferred' : key]}
                  </Heading>
                  <ul>
                    {job[key].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>
              ),
          )}
          {job.closingDate && (
            <p>
              {copy.closing}:{' '}
              <time dateTime={job.closingDate}>
                {new Date(job.closingDate).toISOString().slice(0, 10)} (UTC)
              </time>
            </p>
          )}
        </article>
        {demo ? (
          <p role="note">
            {
              {
                en: 'Demonstration role only. This example does not accept applications.',
                tr: 'Yalnızca örnek bir roldür. Bu örnek başvuru kabul etmez.',
                ar: 'دور وظيفي تجريبي فقط. هذا النموذج لا يستقبل طلبات توظيف.',
              }[locale.data]
            }
          </p>
        ) : (
          <ApplicationForm slug={job.slug} locale={locale.data} siteKey={job.turnstileSiteKey} />
        )}
      </div>
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/careers/[slug]', await baseMetadata(props));
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/careers/[slug]'.replace(
    '[slug]',
    Array.isArray(slug) ? slug.join('/') : String(slug),
  );
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
