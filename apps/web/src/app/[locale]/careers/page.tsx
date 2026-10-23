import { Heading } from '@tevoniq/ui';
import { PageBreadcrumbs } from '@/components/seo/structured-data';
import { routeMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { localeSchema, jobQuerySchema, employmentTypes, workModes } from '@tevoniq/validation';
import { getCareerJobs } from '@/lib/careers';
import { careersCopy, careerLabel } from '@/content/careers';
import './careers.css';
const baseMetadata = {
  title: 'Careers | TEVONIQ',
  description: 'Explore current job openings at TEVONIQ.',
  robots: { index: true, follow: true },
};
async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = localeSchema.safeParse((await params).locale);
  if (!locale.success) notFound();
  const raw = await searchParams;
  const query = jobQuerySchema.safeParse({
    page: raw.page || '1',
    q: raw.q || '',
    ...(raw.workMode ? { workMode: raw.workMode } : {}),
    ...(raw.employmentType ? { employmentType: raw.employmentType } : {}),
  });
  if (!query.success) notFound();
  const copy = careersCopy[locale.data];
  let result;
  const values = Object.fromEntries(Object.entries(query.data).map(([k, v]) => [k, String(v)]));
  try {
    result = await getCareerJobs(values);
  } catch {
    /* Render an honest unavailable state. */
  }
  const href = (page: number) =>
    `/${locale.data}/careers?${new URLSearchParams({ ...values, page: String(page) })}`;
  return (
    <main id="main-content" className="careers-page">
      <header className="careers-hero">
        <div className="careers-container">
          <p>TEVONIQ</p>
          <Heading as="h1">{copy.title}</Heading>
          <p>{copy.intro}</p>
        </div>
      </header>
      <div className="careers-container careers-body">
        <form method="get" className="career-filters">
          <label>
            {copy.search}
            <input className="tv-input" name="q" defaultValue={query.data.q} maxLength={150} />
          </label>
          <label>
            {copy.employment}
            <select
              className="tv-input"
              name="employmentType"
              defaultValue={query.data.employmentType || ''}
            >
              <option value="">{copy.all}</option>
              {employmentTypes.map((t) => (
                <option key={t} value={t}>
                  {careerLabel(t)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {copy.mode}
            <select className="tv-input" name="workMode" defaultValue={query.data.workMode || ''}>
              <option value="">{copy.all}</option>
              {workModes.map((t) => (
                <option key={t} value={t}>
                  {careerLabel(t)}
                </option>
              ))}
            </select>
          </label>
          <button className="tv-button" type="submit">
            {copy.search}
          </button>
        </form>
        {!result ? (
          <p role="status">{copy.unavailable}</p>
        ) : !result.items.length ? (
          <p role="status">{copy.empty}</p>
        ) : (
          <div className="career-jobs">
            {result.items.map((job) => (
              <article className="career-job" key={job.id}>
                <p className="career-eyebrow">{job.department}</p>
                <Heading as="h2">
                  <a href={`/${locale.data}/careers/${job.slug}`}>{job.title}</a>
                </Heading>
                <p>
                  {job.location} · {careerLabel(job.workMode)} · {careerLabel(job.employmentType)}
                </p>
                {job.closingDate && (
                  <p>
                    {copy.closing}:{' '}
                    <time dateTime={job.closingDate}>
                      {new Date(job.closingDate).toISOString().slice(0, 10)} (UTC)
                    </time>
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
        {result && result.total > result.limit && (
          <nav className="career-pagination" aria-label={copy.title}>
            {result.page > 1 && <a href={href(result.page - 1)}>{copy.previous}</a>}
            <span>
              {result.page} / {Math.ceil(result.total / result.limit)}
            </span>
            {result.page * result.limit < result.total && (
              <a href={href(result.page + 1)}>{copy.next}</a>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return routeMetadata(props, '/careers', baseMetadata);
}

export default async function Page(props: Parameters<typeof PublicPage>[0]) {
  const params = await props.params;
  const slug = 'slug' in params ? params.slug : '';
  const path = '/careers'.replace('[slug]', Array.isArray(slug) ? slug.join('/') : String(slug));
  return (
    <>
      <PageBreadcrumbs locale={params.locale} path={path} />
      {await PublicPage(props)}
    </>
  );
}
