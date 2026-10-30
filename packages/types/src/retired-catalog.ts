/** Owner-requested public catalog removals. Archived CMS records remain private. */
export const retiredServiceSlugs = [
  'managed-it-services',
  'api-integration',
  'business-continuity',
  'computer-vision',
  'ai-agent-development',
  'generative-ai',
  'rag-development',

  'team-extension',
  'cloud-solutions',
  'cloud-migration',
  'devops',
  'cloud-infrastructure-management',
  'cloud-modernization',
  'cloud-application-development',
  'robotic-process-automation',
  'sap-services',
  'data-and-analytics',
  'data-lake-consulting',
  'data-warehouse-consulting',
  'data-governance',
  'data-migration',
  'data-engineering',
  'power-bi-consulting',
  'devsecops',
  'application-security-testing',
  'penetration-testing',
  'game-development',
  'immersive-technology',
] as const;
export const retiredSolutionSlugs = ['resilient-hybrid-cloud'] as const;
export const retiredCatalogLabels = [
  'Yönetilen BT Hizmetleri',
  'خدمات تقنية المعلومات المُدارة',
  'System Integration',
  'Sistem Entegrasyonu',
  'تكامل الأنظمة',
  'AI Agent Development Services',
  'Yapay Zekâ Ajanı Geliştirme',
  'تطوير وكلاء الذكاء الاصطناعي',
  'Computer Vision',
  'Bilgisayarlı Görü',
  'الرؤية الحاسوبية',
  'Generative AI',
  'Üretken Yapay Zekâ',
  'الذكاء الاصطناعي التوليدي',
  'RAG Development',
  'RAG Geliştirme',
  'تطوير أنظمة RAG',
  'Business Continuity',
  'İş Sürekliliği',
  'استمرارية الأعمال',
  'API & System Integration',
  'API ve Sistem Entegrasyonu',
  'تكامل الأنظمة وواجهات API',
  'Managed IT Operations',
  'Yönetilen BT Operasyonları',
  'إدارة وتشغيل تقنية المعلومات',
  'Managed IT Services',
  'API Integration',

  'Team Extension',
  'Ekip Genişletme',
  'توسعة الفرق',
  'Cloud Solutions and Consulting',
  'Bulut Çözümleri ve Danışmanlığı',
  'الحلول والاستشارات السحابية',
  'Cloud Migration',
  'Buluta Geçiş',
  'الانتقال إلى السحابة',
  'DevOps',
  'Cloud Infrastructure Management',
  'Bulut Altyapı Yönetimi',
  'إدارة البنية التحتية السحابية',
  'Cloud Modernization',
  'Bulut Modernizasyonu',
  'تحديث البيئات السحابية',
  'Cloud Application Development',
  'Bulut Uygulama Geliştirme',
  'تطوير التطبيقات السحابية',
  'RPA',
  'Robotik Süreç Otomasyonu',
  'أتمتة العمليات الروبوتية',
  'SAP',
  'Data and Analytics',
  'Veri ve Analitik',
  'البيانات والتحليلات',
  'Data Lake Consulting',
  'Veri Gölü Danışmanlığı',
  'استشارات بحيرات البيانات',
  'Data Warehouse Consulting Services',
  'Veri Ambarı Danışmanlığı',
  'استشارات مستودعات البيانات',
  'Data Governance',
  'Veri Yönetişimi',
  'حوكمة البيانات',
  'Data Migration',
  'Veri Taşıma',
  'ترحيل البيانات',
  'Data Engineering Services',
  'Veri Mühendisliği',
  'خدمات هندسة البيانات',
  'Power BI Consulting',
  'Power BI Danışmanlığı',
  'استشارات Power BI',
  'DevSecOps',
  'Application Security Testing',
  'Uygulama Güvenlik Testi',
  'اختبار أمن التطبيقات',
  'Penetration Testing',
  'Sızma Testi',
  'اختبار الاختراق',
  'Game Development',
  'Oyun Geliştirme',
  'تطوير الألعاب',
  'Immersive Tech',
  'Sürükleyici Teknolojiler',
  'التقنيات الغامرة',
  'Cloud Solutions',
  'الحلول السحابية',
  'Bulut Çözümleri',
  'Data Infrastructure',
  'البنية التحتية للبيانات',
  'Veri Altyapısı',
  'Cloud & Infrastructure',
  'السحابة والبنية التحتية',
  'Bulut ve Altyapı',
  'Data & Analytics',
] as const;
export const retiredExtraPaths = [
  '/solutions/resilient-hybrid-cloud',
  '/projects/demo-cloud-independent-iot',
  '/projects/demo-logistics-data-platform',
  '/insights/blog/demo-cloud-migration-planning',
  '/insights/resources/demo-cloud-review-workbook',
  '/insights/resources/demo-data-quality-guide',
  '/careers/demo-cloud-engineer',
] as const;

export const retiredProjectSlugs = ['demo-cloud-independent-iot', 'demo-logistics-data-platform'];
export const retiredArticleSlugs = [
  'demo-cloud-migration-planning',
  'demo-cloud-review-workbook',
  'demo-data-quality-guide',
  ...retiredProjectSlugs.map((slug) => `${slug}-case-study`),
  'brand-protection-security',
  'clinical-trial-modernization',
];
export const retiredJobSlugs = ['demo-cloud-engineer'];
const slugs = new Set<string>(retiredServiceSlugs);
const allSlugs = new Set<string>([
  ...retiredServiceSlugs,
  ...retiredSolutionSlugs,
  ...retiredProjectSlugs,
  ...retiredArticleSlugs,
  ...retiredJobSlugs,
]);
const normalLabel = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[\u064b-\u065f\u0670\u0640]/g, '')
    .trim()
    .toLocaleLowerCase();
const labels = new Set(retiredCatalogLabels.map(normalLabel));
export const retiredPublicPaths: string[] = [
  ...retiredServiceSlugs.flatMap((slug) => [`/services/${slug}`, `/solutions/${slug}`]),
  ...retiredExtraPaths,
  ...retiredArticleSlugs.flatMap((slug) =>
    ['blog', 'resources', 'case-studies'].map((kind) => `/insights/${kind}/${slug}`),
  ),
  ...retiredArticleSlugs.map((slug) => `/insights/${slug}`),
];
export const retiredLocalizedPaths = retiredPublicPaths.flatMap((path) =>
  ['en', 'tr', 'ar'].map((locale) => `/${locale}${path}`),
);
const paths = new Set(retiredPublicPaths);

export function isRetiredService(slug: string) {
  return slugs.has(slug);
}
export function isRetiredCatalogLabel(value: string) {
  return labels.has(normalLabel(value));
}
export function isRetiredPublicPath(value: string): boolean {
  let path: string;
  try {
    path = decodeURIComponent(new URL(value, 'https://tevoniq.invalid').pathname).toLowerCase();
  } catch {
    return false;
  }
  path = path
    .replace(/^\/api\/v1(?=\/)/, '')
    .replace(/^\/(en|tr|ar)(?=\/)/, '')
    .replace(/\/+$/, '');
  return paths.has(path) || [...paths].some((entry) => path.startsWith(entry + '/'));
}

/** Remove retired cards/links at publication boundaries, including old stored CMS blocks. */
export function pruneRetiredCatalog<T>(input: T): T | undefined {
  const visit = (value: unknown, dropString = true): unknown => {
    if (typeof value === 'string') {
      if (
        dropString &&
        (allSlugs.has(value) || isRetiredCatalogLabel(value) || isRetiredPublicPath(value))
      )
        return undefined;
      return value
        .replace(/Penetration testing, round/gi, 'Round')
        .replace(/Sızma testi, sürekli/gi, 'Sürekli')
        .replace(/اختبارات الاختراق و/g, '')
        .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<\/a>/gi, (link, href: string) =>
          isRetiredPublicPath(href) ? '' : link,
        )
        .replace(/\[[^\]]*\]\(([^)]+)\)/g, (link, href: string) =>
          isRetiredPublicPath(href) ? '' : link,
        );
    }
    if (Array.isArray(value))
      return value.map((item) => visit(item)).filter((item) => item !== undefined);
    if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype)
      return value;
    const record = value as Record<string, unknown>;
    if (
      ['href', 'url', 'path', 'route'].some(
        (key) => typeof record[key] === 'string' && isRetiredPublicPath(record[key]),
      )
    )
      return undefined;
    if (typeof record.slug === 'string' && allSlugs.has(record.slug)) return undefined;
    if (
      ['title', 'label', 'name', 'text', 'heading'].some(
        (key) => typeof record[key] === 'string' && isRetiredCatalogLabel(record[key]),
      )
    )
      return undefined;
    const result = Object.fromEntries(
      Object.entries(record).flatMap(([key, item]) => {
        const result = key === 'query' ? item : visit(item, false);
        return result === undefined ? [] : [[key, result]];
      }),
    );
    if (
      Array.isArray(record.items) &&
      record.items.length &&
      Array.isArray(result.items) &&
      !result.items.length &&
      typeof record.type === 'string'
    )
      return undefined;
    if ('content' in record && record.content !== undefined && !('content' in result))
      return undefined;
    return result;
  };
  return visit(input) as T | undefined;
}
