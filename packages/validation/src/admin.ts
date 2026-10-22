import { z } from 'zod';
import { seoRecordDataSchema, organizationSettingsSchema } from './seo.js';
import { cmsRoleSchema, passwordSchema, accountEmailSchema } from './rbac.js';
export const adminModules = [
  'pages',
  'team',
  'partners',
  'testimonials',
  'careers',
  'job-applications',
  'leads',
  'messages',
  'newsletter',
  'media',
  'navigation',
  'translations',
  'seo',
  'site-settings',
] as const;
export type AdminModule = (typeof adminModules)[number];
export type AdminField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'email' | 'url' | 'date' | 'checkbox';
  required?: boolean;
};
export const adminDefinitions: Record<
  AdminModule,
  { title: string; description: string; statuses: string[]; fields: AdminField[] }
> = {
  pages: {
    title: 'Pages',
    description: 'Manage page copy and publication. Company pages use their dedicated editor.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'path', label: 'Page path', required: true },
      { key: 'body', label: 'Page content', type: 'textarea' },
    ],
  },
  team: {
    title: 'Team',
    description: 'Maintain verified team profiles.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'role', label: 'Job title' },
      { key: 'bio', label: 'Biography', type: 'textarea' },
      { key: 'image', label: 'Portrait URL', type: 'url' },
    ],
  },
  partners: {
    title: 'Partners',
    description: 'Maintain verified partner information.',
    statuses: ['draft', 'published'],
    fields: [
      {
        key: 'verified',
        label: 'Partnership verified and approved for public display',
        type: 'checkbox',
      },
      { key: 'website', label: 'Website', type: 'url' },
      { key: 'image', label: 'Logo URL', type: 'url' },
      { key: 'description', label: 'Partnership details', type: 'textarea' },
    ],
  },
  testimonials: {
    title: 'Testimonials',
    description: 'Record approved testimonials and attribution.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'quote', label: 'Quote', type: 'textarea', required: true },
      { key: 'author', label: 'Author', required: true },
      { key: 'company', label: 'Company' },
    ],
  },
  careers: {
    title: 'Careers',
    description: 'Manage job opportunities and their requirements.',
    statuses: ['draft', 'published', 'closed'],
    fields: [
      { key: 'location', label: 'Location / remote policy' },
      { key: 'employmentType', label: 'Employment type' },
      { key: 'description', label: 'Job description', type: 'textarea' },
      { key: 'applyUrl', label: 'Application URL', type: 'url' },
    ],
  },
  'job-applications': {
    title: 'Job Applications',
    description: 'Review applicants and track hiring decisions.',
    statuses: ['new', 'reviewing', 'interview', 'hired', 'rejected'],
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'position', label: 'Position' },
      { key: 'resumeUrl', label: 'Resume URL', type: 'url' },
      { key: 'notes', label: 'Internal notes', type: 'textarea' },
    ],
  },
  leads: {
    title: 'Leads',
    description: 'Track enquiries from first contact through resolution.',
    statuses: ['new', 'open', 'qualified', 'closed'],
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone' },
      { key: 'company', label: 'Company' },
      { key: 'source', label: 'Source' },
      { key: 'notes', label: 'Enquiry / internal notes', type: 'textarea' },
    ],
  },
  messages: {
    title: 'Website Messages',
    description: 'Review and resolve website enquiries.',
    statuses: ['new', 'open', 'closed'],
    fields: [
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'message', label: 'Message', type: 'textarea', required: true },
    ],
  },
  newsletter: {
    title: 'Newsletter',
    description: 'Manage subscription records and consent. No emails are sent from this screen.',
    statuses: ['pending', 'subscribed', 'unsubscribed'],
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'consent', label: 'Consent source / evidence', required: true },
      { key: 'consentDate', label: 'Consent date', type: 'date' },
    ],
  },
  media: {
    title: 'Media Library',
    description: 'Organize asset URLs, descriptions, and usage references.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'url', label: 'Asset URL', type: 'url', required: true },
      { key: 'alt', label: 'Alt text', required: true },
      { key: 'credit', label: 'Credit / license' },
    ],
  },
  navigation: {
    title: 'Navigation',
    description: 'Manage navigation labels and destinations.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'href', label: 'Destination path', required: true },
      { key: 'group', label: 'Navigation group: main, company, insights, services, solutions' },
      { key: 'order', label: 'Sort order' },
    ],
  },
  translations: {
    title: 'Translations',
    description: 'Maintain translation keys and localized text.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'key', label: 'Translation key', required: true },
      { key: 'value', label: 'Translated text', type: 'textarea', required: true },
    ],
  },
  seo: {
    title: 'SEO',
    description:
      'Published overrides apply to every public page, including articles and catalogs. Use paths without the language prefix (for example /services/cloud).',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'path', label: 'Page path', required: true },
      { key: 'seoTitle', label: 'SEO title' },
      { key: 'description', label: 'SEO description', type: 'textarea' },
      { key: 'canonical', label: 'Canonical URL', type: 'url' },
      { key: 'ogImage', label: 'OG image URL', type: 'url' },
      {
        key: 'robots',
        label: 'Robots (index,follow / noindex,follow / noindex,nofollow / index,nofollow)',
      },
      { key: 'ogTitle', label: 'OpenGraph title' },
      { key: 'ogDescription', label: 'OpenGraph description', type: 'textarea' },
      { key: 'twitterTitle', label: 'Twitter title' },
      { key: 'twitterDescription', label: 'Twitter description', type: 'textarea' },
      { key: 'twitterImage', label: 'Twitter image URL', type: 'url' },
      { key: 'twitterCard', label: 'Twitter card (summary / summary_large_image)' },
    ],
  },
  'site-settings': {
    title: 'Site Settings',
    description:
      'For public company identity, use key organization and publish one verified record. Leave unknown details empty. Never store secrets here.',
    statuses: ['draft', 'published'],
    fields: [
      { key: 'key', label: 'Setting key', required: true },
      { key: 'value', label: 'Setting value (other settings)', type: 'textarea' },
      { key: 'companyName', label: 'Company name' },
      { key: 'legalName', label: 'Legal name' },
      { key: 'logo', label: 'Official logo URL', type: 'url' },
      { key: 'email', label: 'Public email', type: 'email' },
      { key: 'phone', label: 'Public phone' },
      { key: 'streetAddress', label: 'Street address' },
      { key: 'addressLocality', label: 'City' },
      { key: 'addressRegion', label: 'Region' },
      { key: 'postalCode', label: 'Postal code' },
      { key: 'addressCountry', label: 'Country (two-letter ISO code)' },
      {
        key: 'socialProfiles',
        label: 'Official social profiles (one URL per line)',
        type: 'textarea',
      },
      { key: 'defaultDescription', label: 'Default meta description', type: 'textarea' },
      { key: 'defaultOgImage', label: 'Default social image URL', type: 'url' },
      { key: 'twitterSite', label: 'Company Twitter / X @username' },
      { key: 'footerDescriptionEn', label: 'Footer description (English)', type: 'textarea' },
      { key: 'footerDescriptionTr', label: 'Footer description (Turkish)', type: 'textarea' },
      { key: 'footerDescriptionAr', label: 'Footer description (Arabic)', type: 'textarea' },
      { key: 'privacyPolicyUrl', label: 'Privacy Policy URL or page path' },
      { key: 'termsUrl', label: 'Terms URL or page path' },
      { key: 'cookiePolicyUrl', label: 'Cookie Policy URL or page path' },
    ],
  },
};
export const adminModuleSchema = z.enum(adminModules);
export const adminQuerySchema = z
  .object({
    q: z.string().trim().max(200).default(''),
    status: z.string().max(40).default(''),
    language: z.enum(['en', 'tr', 'ar']).optional(),
    trash: z.enum(['active', 'deleted', 'all']).default('active'),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['title', 'createdAt', 'updatedAt', 'status']).default('updatedAt'),
    direction: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();
export const adminRecordSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    language: z.enum(['en', 'tr', 'ar']),
    status: z.string().min(1).max(40),
    data: z.record(z.string(), z.string().max(20000)),
    referenceIds: z
      .array(z.string().uuid())
      .max(50)
      .refine((v) => new Set(v).size === v.length, 'References must be unique'),
    version: z.number().int().min(0),
  })
  .strict();
export function adminWriteSchema(module: AdminModule) {
  const definition = adminDefinitions[module];
  return adminRecordSchema.superRefine((value, ctx) => {
    const schema =
      module === 'seo'
        ? seoRecordDataSchema
        : module === 'site-settings' && value.data.key === 'organization'
          ? organizationSettingsSchema
          : null;
    if (schema) {
      const result = schema.safeParse(value.data);
      if (!result.success)
        for (const issue of result.error.issues)
          ctx.addIssue({ code: 'custom', path: ['data', ...issue.path], message: issue.message });
      if (
        module === 'site-settings' &&
        value.status === 'published' &&
        !value.data.companyName?.trim()
      )
        ctx.addIssue({
          code: 'custom',
          path: ['data', 'companyName'],
          message: 'Supply the real company name before publishing',
        });
    }
    if (!definition.statuses.includes(value.status))
      ctx.addIssue({
        code: 'custom',
        path: ['status'],
        message: 'Invalid status for this section',
      });
    for (const key of Object.keys(value.data))
      if (!definition.fields.some((f) => f.key === key))
        ctx.addIssue({ code: 'custom', path: ['data', key], message: 'Unknown field' });
    for (const field of definition.fields) {
      const text = value.data[field.key]?.trim() || '';
      if (field.type === 'checkbox' && text && !['true', 'false'].includes(text))
        ctx.addIssue({
          code: 'custom',
          path: ['data', field.key],
          message: 'Invalid checkbox value',
        });
      if (field.required && !text)
        ctx.addIssue({ code: 'custom', path: ['data', field.key], message: 'Required field' });
      if (text && field.type === 'email' && !z.email().safeParse(text).success)
        ctx.addIssue({ code: 'custom', path: ['data', field.key], message: 'Invalid email' });
      if (
        text &&
        field.type === 'url' &&
        (!URL.canParse(text) || !['https:', 'http:'].includes(new URL(text).protocol))
      )
        ctx.addIssue({ code: 'custom', path: ['data', field.key], message: 'Use an HTTP(S) URL' });
      if (text && field.type === 'date' && !z.iso.date().safeParse(text).success)
        ctx.addIssue({ code: 'custom', path: ['data', field.key], message: 'Invalid date' });
      if (
        text &&
        ['path', 'href'].includes(field.key) &&
        !/^\/(?!\/)[a-zA-Z0-9_/?=&%.-]*$/.test(text)
      )
        ctx.addIssue({
          code: 'custom',
          path: ['data', field.key],
          message: 'Use a local path beginning with /',
        });
    }
  });
}
export const adminBulkSchema = z
  .object({
    action: z.enum(['archive', 'restore', 'status']),
    status: z.string().max(40).optional(),
    records: z
      .array(z.object({ id: z.string().uuid(), version: z.number().int().min(0) }).strict())
      .min(1)
      .max(100)
      .refine((v) => new Set(v.map((r) => r.id)).size === v.length, 'Duplicate selection'),
    confirmation: z.literal('CONFIRM'),
  })
  .strict();
export const adminUserWriteSchema = z
  .object({
    email: accountEmailSchema,
    role: cmsRoleSchema,
    password: passwordSchema.optional(),
    disabled: z.boolean(),
    version: z.number().int().min(0),
    confirmation: z.literal('CONFIRM'),
  })
  .strict();
export type AdminRecordWrite = z.infer<typeof adminRecordSchema>;
