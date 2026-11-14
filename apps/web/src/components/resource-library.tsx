import Link from 'next/link';
import { Download, FileText, ArrowUpLeft } from 'lucide-react';
import type { PublicArticle } from '@tevoniq/validation';
import { resourceDownload } from '@/content/resource-library';
import './resource-library.css';
export function ResourceDownloadPanel({ slug }: { slug: string }) {
  const resource = resourceDownload(slug);
  if (!resource) return null;
  return (
    <section className="resource-download" aria-label="تنزيل المورد">
      <div>
        <p className="resource-label">ملف مجاني · {resource.format} · بالعربية</p>
        <h2>{resource.title}</h2>
        <p>{resource.usage}</p>
      </div>
      <a
        download
        href={`/downloads/resources/${resource.file}`}
        className="resource-download-button"
      >
        <Download size={19} aria-hidden="true" />
        تنزيل {resource.format}
      </a>
      <p className="resource-download-note">تنزيل مباشر دون تسجيل أو إدخال البريد.</p>
      {slug === 'demo-discovery-checklist' && (
        <div className="resource-expanded">
          <h3>أسئلة إضافية لإعداد الاجتماع</h3>
          {resource.sections.map(([title, ...questions]) => (
            <div key={title}>
              <h4>{title}</h4>
              <ul>
                {questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
export function ResourceCards({ articles }: { articles: PublicArticle[] }) {
  return (
    <div className="resource-library-grid">
      {articles.map((article) => {
        const resource = resourceDownload(article.slug);
        return (
          <article className="resource-library-card" key={article.id}>
            <FileText size={29} aria-hidden="true" />
            <p className="resource-label">
              {resource ? `${resource.format} · عربي · تنزيل مجاني` : 'مورد عملي'}
            </p>
            <h3>
              <Link href={`/ar/insights/resources/${article.slug}`}>{article.title}</Link>
            </h3>
            <p>{article.excerpt}</p>
            <div className="resource-card-actions">
              <Link href={`/ar/insights/resources/${article.slug}`}>
                المعاينة وطريقة الاستخدام <ArrowUpLeft size={16} aria-hidden="true" />
              </Link>
              {resource && (
                <a download href={`/downloads/resources/${resource.file}`}>
                  <Download size={17} aria-hidden="true" />
                  تنزيل {resource.format}
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
