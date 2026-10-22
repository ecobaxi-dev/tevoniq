import { z } from 'zod';

export const companySlugs = ['about', 'why-tevoniq', 'team', 'partners', 'careers'] as const;
export const companySlugSchema = z.enum(companySlugs);
export const companyContentSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    intro: z.string().trim().max(2000),
    seoDescription: z.string().trim().max(320),
    foundingYear: z.number().int().min(1000).max(9999).nullable(),
    geographicCoverage: z.string().trim().max(1000),
    sections: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(160),
            body: z.string().trim().min(1).max(8000),
          })
          .strict(),
      )
      .max(40),
    cta: z
      .object({
        title: z.string().trim().min(1).max(160),
        body: z.string().trim().max(2000),
        label: z.string().trim().min(1).max(100),
        href: z
          .string()
          .regex(/^\/(?!\/)[a-zA-Z0-9\-_/]*$/, 'Use an internal path, such as /contact'),
      })
      .strict(),
  })
  .strict();
export const companyWriteSchema = z
  .object({
    content: companyContentSchema,
    published: z.boolean(),
    version: z.number().int().min(0),
  })
  .strict();
export type CompanyContent = z.infer<typeof companyContentSchema>;
export type CompanyWrite = z.infer<typeof companyWriteSchema>;

const about = [
  [
    'Who We Are',
    'TEVONIQ focuses on connecting technology decisions with business needs. Our approach brings engineering, thoughtful design, and practical problem-solving together.',
  ],
  [
    'Our Vision',
    'Technology that helps organizations move forward with confidence, clarity, and room to grow.',
  ],
  [
    'Our Mission',
    'To turn complex requirements into useful digital systems through careful planning, collaborative delivery, and responsible engineering.',
  ],
  [
    'Our Values',
    'Clarity in communication. Accountability in decisions. Curiosity in problem-solving. Respect for the people who build and use technology.',
  ],
  [
    'What We Do',
    'We approach software, connected systems, and digital infrastructure as parts of a larger business challenge. Explore our services to understand the areas where we can collaborate.',
  ],
  [
    'Technology Philosophy',
    'Choose technology for the problem it solves. Favor maintainable designs, explicit tradeoffs, and security considered from the start. Build with future change in mind.',
  ],
  [
    'Global Perspective',
    'We value different perspectives and consider language, accessibility, and cultural context in technology design. Our outlook is open to collaboration across backgrounds.',
  ],
];
const why = [
  [
    'Engineering Excellence',
    'We value clear requirements, deliberate architecture, readable code, and testing that checks the behavior people depend on.',
  ],
  [
    'Innovation',
    'Explore new ideas with a clear purpose. Evaluate emerging technology against practical needs before making it part of a solution.',
  ],
  [
    'Security',
    'Consider access, data protection, and threats throughout design and delivery. Make security decisions explicit and proportionate to the system.',
  ],
  [
    'Reliability',
    'Plan for failures, make systems observable, and define recovery expectations alongside normal operation.',
  ],
  [
    'Scalability',
    'Design around expected demand and measurable constraints, with a path to evolve as requirements change.',
  ],
  [
    'Business Understanding',
    'Start with the people, workflows, and outcomes behind a request. Connect technical choices to business priorities and constraints.',
  ],
  [
    'Long-Term Partnership',
    'Value open communication, shared knowledge, and maintainability so that a solution can continue to evolve after its initial delivery.',
  ],
];
export function defaultCompanyContent(slug: z.infer<typeof companySlugSchema>): CompanyContent {
  const title = {
    about: 'About TEVONIQ',
    'why-tevoniq': 'Why TEVONIQ',
    team: 'Our Team',
    partners: 'Partners',
    careers: 'Careers',
  }[slug];
  const sections =
    slug === 'about'
      ? about
      : slug === 'why-tevoniq'
        ? why
        : {
            team: [
              [
                'How We Work',
                'We value curiosity, clear communication, and shared responsibility. Our approach brings different perspectives into the decisions that shape technology.',
              ],
            ],
            partners: [
              [
                'Build Together',
                'Meaningful collaboration starts with complementary capabilities, clear expectations, and shared goals. Contact us to discuss a potential partnership.',
              ],
            ],
            careers: [
              [
                'Work With Purpose',
                'We value thoughtful problem-solving, continuous learning, and respect for others. Contact us to ask about career opportunities.',
              ],
            ],
          }[slug];
  return {
    title,
    intro:
      slug === 'why-tevoniq'
        ? 'The principles that guide our approach to technology and collaboration.'
        : 'Thoughtful technology. Clear purpose. Shared progress.',
    seoDescription: `${title}: our approach to technology, people, and collaboration.`,
    foundingYear: null,
    geographicCoverage: '',
    sections: sections.map(([heading, body]) => ({ title: heading!, body: body! })),
    cta: {
      title: 'Let’s start a conversation',
      body: 'Tell us what you are working toward, and explore how we could work together.',
      label: 'Contact us',
      href: '/contact',
    },
  };
}
