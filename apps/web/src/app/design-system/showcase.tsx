'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Download,
  Globe2,
  Layers3,
  Mail,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import {
  Accordion,
  Badge,
  Breadcrumb,
  Button,
  ButtonLink,
  Card,
  Checkbox,
  Container,
  CTA,
  Drawer,
  Dropdown,
  EmptyState,
  ErrorState,
  FeatureCard,
  IconButton,
  IndustryCard,
  Input,
  LanguageSwitcher,
  Logo,
  Modal,
  Navigation,
  Pagination,
  Radio,
  Section,
  SectionHeader,
  Select,
  ServiceCard,
  Skeleton,
  StatCard,
  Switch,
  Tabs,
  Tag,
  Textarea,
  Toast,
  ToastProvider,
  Tooltip,
  UIProvider,
} from '@tevoniq/ui';
import type { ButtonVariant, Theme } from '@tevoniq/ui';
import tokens from '@tevoniq/config/design-tokens.json';
import { BrandImage, BrandLogo } from '@/components/brand-image';
import { brandAssets } from '@/config/assets';

const sections = [
  {
    group: 'FOUNDATIONS',
    items: [
      ['overview', 'Overview'],
      ['colors', 'Color system'],
      ['typography', 'Typography'],
      ['tokens', 'Layout & tokens'],
    ],
  },
  {
    group: 'COMPONENTS',
    items: [
      ['buttons', 'Buttons & actions'],
      ['cards', 'Cards & surfaces'],
      ['forms', 'Form controls'],
      ['navigation', 'Navigation'],
      ['disclosure', 'Tabs & accordion'],
      ['overlays', 'Overlays & feedback'],
      ['states', 'System states'],
    ],
  },
  {
    group: 'PATTERNS',
    items: [
      ['composition', 'Composition'],
      ['brand', 'Brand assets'],
    ],
  },
];
const variants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'gold-accent'];
const colorNames: Record<string, string> = {
  navy: 'Deep Navy',
  electric: 'Electric Blue',
  cyan: 'Cyan',
  gold: 'Premium Gold',
  mist: 'Light Gray',
  ink: 'Dark Gray',
  white: 'White',
};
const formSchema = z.object({
  email: z.email('Enter a valid email address.'),
  message: z.string().min(10, 'Use at least 10 characters.'),
});
type FormValues = z.infer<typeof formSchema>;

function Specimen({
  title,
  children,
  caption,
}: {
  title: string;
  children: ReactNode;
  caption?: string;
}) {
  return (
    <div className="ds-specimen">
      <div className="ds-specimen-label">{title}</div>
      <div className="ds-specimen-body">{children}</div>
      {caption && <p className="ds-specimen-caption">{caption}</p>}
    </div>
  );
}
function DemoForm({ notify }: { notify: (title: string, description?: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  return (
    <form
      onSubmit={handleSubmit(() => {
        notify('Validation passed', 'This development form does not submit or store data.');
        reset();
      })}
      noValidate
      className="ds-stack"
    >
      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        leadingIcon={<Mail size={17} />}
        {...register('email')}
        {...(errors.email?.message ? { error: errors.email.message } : {})}
      />
      <Textarea
        label="Your message"
        placeholder="Write a short test message…"
        {...register('message')}
        {...(errors.message?.message ? { error: errors.message.message } : {})}
      />
      <Button type="submit" loading={isSubmitting} trailingIcon={<ArrowRight size={16} />}>
        Validate form
      </Button>
      <p className="tv-field-hint">Development example. Nothing is sent or saved.</p>
    </form>
  );
}
export function DesignSystemShowcase() {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState('en');
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState(['Interface', 'Technology', 'Enterprise']);
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState({ open: false, title: '', description: '' });
  const [query, setQuery] = useState('');
  const [exampleSwitch, setExampleSwitch] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const notify = (title: string, description = '') => setToast({ open: true, title, description });
  const changeTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  return (
    <UIProvider theme={theme} direction={language === 'ar' ? 'rtl' : 'ltr'}>
      <ToastProvider label="Notifications">
        <a className="ds-skip" href="#ds-main">
          Skip to components
        </a>
        <div className="ds-topbar">
          <a className="ds-brand" href="#overview">
            <Logo
              size="sm"
              label="TEVONIQ"
              image={<BrandImage asset={brandAssets.icons.brand} alt="TEVONIQ" />}
            />
            <span>
              TEVONIQ<span className="ds-brand-sub">DESIGN SYSTEM</span>
            </span>
          </a>
          <div className="ds-topbar-meta">
            <span className="ds-version">INTERFACE LIBRARY / 0.1</span>
            <Badge tone="blue" dot>
              Development
            </Badge>
          </div>
          <div className="ds-topbar-actions">
            <LanguageSwitcher
              label="Preview direction"
              value={language}
              onValueChange={setLanguage}
              options={[
                { value: 'en', label: 'EN', lang: 'en' },
                { value: 'tr', label: 'TR', lang: 'tr' },
                { value: 'ar', label: 'العربية', lang: 'ar' },
              ]}
            />
            <Tooltip content={theme === 'light' ? 'Preview dark theme' : 'Preview light theme'}>
              <IconButton
                variant="ghost"
                label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                onClick={changeTheme}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </IconButton>
            </Tooltip>
            <ButtonLink href="/en" variant="outline" size="sm">
              View website <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
        </div>
        <div className="ds-workspace">
          <aside className="ds-sidebar">
            <div className="ds-sidebar-search">
              <Input
                label="Find a component"
                placeholder="Quick find…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                leadingIcon={<Search size={14} />}
              />
            </div>
            <nav aria-label="Design system sections">
              {sections.map((group) => (
                <div key={group.group} className="ds-nav-group">
                  <p>{group.group}</p>
                  {group.items
                    .filter(([, label]) => label?.toLowerCase().includes(query.toLowerCase()))
                    .map(([id, label]) => (
                      <a key={id} href={'#' + id}>
                        {label}
                        {id === 'overview' && <span className="ds-nav-dot" />}
                      </a>
                    ))}
                </div>
              ))}
            </nav>
            <div className="ds-sidebar-footer">
              <span className="ds-small-mark" />
              <p>
                One identity.
                <br />
                Every interaction.
              </p>
              <span>TEVONIQ / PREMIUM TECHNOLOGY</span>
            </div>
          </aside>
          <main id="ds-main" className="ds-main">
            <section id="overview" className="ds-hero" data-theme="dark">
              <div className="ds-hero-copy">
                <p className="tv-eyebrow">
                  <span /> THE TEVONIQ DESIGN LANGUAGE
                </p>
                <h1 className="tv-display">
                  Precision.
                  <br />
                  In every <span>detail.</span>
                </h1>
                <p className="ds-hero-description">
                  A considered system of foundations, components, and patterns. Built to make every
                  TEVONIQ experience feel unmistakably connected.
                </p>
                <div className="ds-hero-actions">
                  <ButtonLink href="#buttons" size="lg">
                    Explore components
                    <ArrowRight size={17} />
                  </ButtonLink>
                  <a href="#tokens" className="ds-hero-link">
                    View foundations
                    <ArrowUpRight size={17} />
                  </a>
                </div>
                <div className="ds-hero-foot">
                  <span>
                    <CheckCircle2 size={13} /> Responsive by design
                  </span>
                  <span>
                    <Globe2 size={13} /> LTR + RTL
                  </span>
                  <span>
                    <Layers3 size={13} /> Light + dark
                  </span>
                </div>
              </div>
              <div className="ds-hero-art" aria-hidden="true">
                <div className="ds-orbit ds-orbit-one" />
                <div className="ds-orbit ds-orbit-two" />
                <div className="ds-art-card">
                  <div className="ds-art-head">
                    <span className="ds-art-dot" />
                    TEVONIQ / UI
                  </div>
                  <span className="ds-art-aa">
                    Aa<span>.</span>
                  </span>
                  <span className="ds-art-type">SORA × INTER</span>
                  <div className="ds-art-swatches">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="ds-art-button">
                    Designed with purpose
                    <ArrowRight size={14} />
                  </div>
                </div>
                <span className="ds-art-note">INNOVATE — CONNECT — ELEVATE</span>
              </div>
            </section>
            <div className="ds-content">
              <div className="ds-intro-strip">
                <span>
                  <Code2 size={15} /> INTERNAL COMPONENT EXPLORER
                </span>
                <p>All examples are design specimens, not company claims.</p>
                <span>V 0.1.0</span>
              </div>

              <Section id="colors" spacing="compact">
                <SectionHeader
                  eyebrow="01 / FOUNDATIONS"
                  title="Color, with intention."
                  description="Trust at the foundation. Energy in the details. Gold, only where it matters."
                />
                <div className="ds-color-grid">
                  {Object.entries(tokens.colors)
                    .filter(([name]) => name in colorNames)
                    .map(([name, value]) => (
                      <button
                        type="button"
                        className={'ds-color ds-color-' + name}
                        key={name}
                        onClick={() => {
                          void navigator.clipboard
                            .writeText(value)
                            .then(() => notify('Color copied', value))
                            .catch(() => notify('Color value', value));
                        }}
                        aria-label={'Copy ' + colorNames[name] + ' ' + value}
                      >
                        <span className="ds-color-swatch" style={{ background: value }}>
                          <span>{name === 'navy' ? '01' : name === 'electric' ? '02' : ''}</span>
                          <Copy size={14} />
                        </span>
                        <span className="ds-color-info">
                          <strong>{colorNames[name]}</strong>
                          <code>{value}</code>
                        </span>
                      </button>
                    ))}
                </div>
                <div className="ds-gradient-grid">
                  {Object.entries(tokens.gradients).map(([name, value]) => (
                    <div key={name}>
                      <div className="ds-gradient" style={{ background: value }} />
                      <div className="ds-token-caption">
                        <span>{name}</span>
                        <code>--gradient-{name}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="typography" spacing="compact">
                <SectionHeader
                  eyebrow="02 / FOUNDATIONS"
                  title="A clear voice."
                  description="Plus Jakarta Sans defines our Latin typography. Cairo gives Arabic content a clear, confident voice."
                />
                <div className="ds-type-grid">
                  <div className="ds-type-card">
                    <div className="ds-type-label">
                      <span>HEADINGS</span>
                      <Badge>Plus Jakarta Sans</Badge>
                    </div>
                    <p className="ds-type-display">
                      Technology
                      <br />
                      without <span>limits.</span>
                    </p>
                    <div className="ds-type-alphabet">
                      Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk
                      <br />
                      0123456789
                    </div>
                    <div className="ds-type-meta">GEOMETRIC · PRECISE · DISTINCTIVE</div>
                  </div>
                  <div className="ds-type-card ds-body-type">
                    <div className="ds-type-label">
                      <span>BODY & INTERFACE</span>
                      <Badge>Cairo / Plus Jakarta Sans</Badge>
                    </div>
                    <p className="ds-body-display">
                      Clarity in
                      <br />
                      every connection.
                    </p>
                    <p className="tv-description">
                      A calm, confident reading experience. Balanced line lengths, generous leading,
                      and purposeful hierarchy keep complex interfaces clear.
                    </p>
                    <div className="ds-type-alphabet">Regular 400 · Medium 500 · Semibold 600</div>
                    <div className="ds-type-meta">LEGIBLE · VERSATILE · HUMAN</div>
                  </div>
                </div>
                <div className="ds-type-scale">
                  {Object.entries(tokens.typography).map(([name, value]) => (
                    <div key={name}>
                      <code>{name}</code>
                      <span
                        style={{
                          fontSize:
                            name === 'display' ? '2rem' : name === 'h1' ? '1.75rem' : value.size,
                          fontFamily:
                            name === 'body' || name === 'small' || name === 'caption'
                              ? 'var(--font-sans)'
                              : 'var(--font-heading)',
                          fontWeight: value.weight,
                          lineHeight: value.lineHeight,
                          letterSpacing: value.tracking,
                        }}
                      >
                        Premium technology
                      </span>
                      <code>{value.size}</code>
                    </div>
                  ))}
                </div>
              </Section>

              <Section id="tokens" spacing="compact">
                <SectionHeader
                  eyebrow="03 / FOUNDATIONS"
                  title="Room to breathe."
                  description="A consistent spatial rhythm, from a single control to an ultrawide layout."
                />
                <div className="ds-grid-2">
                  <Specimen title="SPACING / 4 PX FOUNDATION">
                    <div className="ds-spacing">
                      {Object.entries(tokens.spacing)
                        .filter(([n]) => Number(n) > 0 && Number(n) <= 16)
                        .map(([n, value]) => (
                          <div key={n}>
                            <code>{n}</code>
                            <span style={{ width: value }} />
                            <code>{value}</code>
                          </div>
                        ))}
                    </div>
                  </Specimen>
                  <Specimen title="RADIUS & ELEVATION">
                    <div className="ds-radius">
                      {Object.entries(tokens.radius).map(([name, value]) => (
                        <div key={name}>
                          <span style={{ borderRadius: value }} />
                          <code>{name}</code>
                        </div>
                      ))}
                    </div>
                    <div className="ds-shadows">
                      {Object.entries(tokens.shadows)
                        .filter(([name]) => name !== 'focus')
                        .map(([name, value]) => (
                          <div key={name} style={{ boxShadow: value }}>
                            <code>{name}</code>
                          </div>
                        ))}
                    </div>
                  </Specimen>
                </div>
                <div className="ds-grid-2 ds-gap-top">
                  {(
                    [
                      ['Container widths', tokens.containers],
                      ['Breakpoints', tokens.breakpoints],
                      ['Transitions', tokens.transitions],
                      ['Z-index layers', tokens.zIndex],
                    ] as const
                  ).map(([title, values]) => (
                    <Specimen title={title.toUpperCase()} key={title}>
                      <dl className="ds-token-list">
                        {Object.entries(values).map(([name, value]) => (
                          <div key={name}>
                            <dt>{name}</dt>
                            <dd>
                              <code>{value}</code>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </Specimen>
                  ))}
                </div>
              </Section>

              <Section id="buttons" spacing="compact">
                <SectionHeader
                  eyebrow="04 / COMPONENTS"
                  title="Make the next move."
                  description="Clear hierarchy. Confident interaction. Five variants, one consistent language."
                />
                <Specimen
                  title="BUTTON VARIANTS"
                  caption="Hover, press, or keyboard-focus any live control to inspect its interactive state."
                >
                  <div className="ds-button-table">
                    <div className="ds-button-table-head">
                      <span>VARIANT</span>
                      <span>DEFAULT</span>
                      <span>WITH ICON</span>
                      <span>LOADING</span>
                      <span>DISABLED</span>
                    </div>
                    {variants.map((variant) => (
                      <div className="ds-button-row" key={variant}>
                        <code>{variant}</code>
                        <Button
                          variant={variant}
                          onClick={() => notify('Button activated', variant + ' variant')}
                        >
                          Get started
                        </Button>
                        <Button
                          variant={variant}
                          trailingIcon={<ArrowRight size={16} />}
                          onClick={() => notify('Next step', variant + ' action')}
                        >
                          Explore
                        </Button>
                        <Button variant={variant} loading>
                          Loading
                        </Button>
                        <Button variant={variant} disabled>
                          Unavailable
                        </Button>
                      </div>
                    ))}
                  </div>
                </Specimen>
                <div className="ds-grid-2 ds-gap-top">
                  <Specimen title="SIZES & ICON BUTTONS">
                    <div className="ds-row">
                      <Button size="sm" onClick={() => notify('Small button')}>
                        Small
                      </Button>
                      <Button size="md" onClick={() => notify('Medium button')}>
                        Medium
                      </Button>
                      <Button size="lg" onClick={() => notify('Large button')}>
                        Large
                      </Button>
                    </div>
                    <div className="ds-row ds-gap-top">
                      <IconButton label="Add example" onClick={() => notify('Add action')}>
                        <Plus size={18} />
                      </IconButton>
                      <IconButton
                        label="Search example"
                        variant="outline"
                        onClick={() => notify('Search action')}
                      >
                        <Search size={18} />
                      </IconButton>
                      <Tooltip content="Configure this design specimen">
                        <IconButton label="Configure example" variant="ghost">
                          <SlidersHorizontal size={18} />
                        </IconButton>
                      </Tooltip>
                      <IconButton label="Disabled example" disabled>
                        <Download size={18} />
                      </IconButton>
                    </div>
                  </Specimen>
                  <Specimen title="BADGES & TAGS">
                    <div className="ds-row">
                      {(
                        ['neutral', 'blue', 'cyan', 'gold', 'success', 'warning', 'danger'] as const
                      ).map((tone) => (
                        <Badge key={tone} tone={tone} dot>
                          {tone}
                        </Badge>
                      ))}
                    </div>
                    <div className="ds-row ds-gap-top">
                      {tags.map((tag) => (
                        <Tag
                          key={tag}
                          label={tag}
                          removeLabel={'Remove ' + tag}
                          onRemove={() => setTags(tags.filter((value) => value !== tag))}
                        />
                      ))}
                      {tags.length === 0 && (
                        <Button
                          variant="ghost"
                          onClick={() => setTags(['Interface', 'Technology', 'Enterprise'])}
                        >
                          Restore tags
                        </Button>
                      )}
                      <Tag label="Read only" />
                    </div>
                  </Specimen>
                </div>
              </Section>

              <Section id="cards" spacing="compact">
                <SectionHeader
                  eyebrow="05 / COMPONENTS"
                  title="Structure with substance."
                  description="Reusable surfaces for features, services, industries, and verified data."
                />
                <div className="ds-grid-3">
                  <FeatureCard
                    title="Feature card"
                    description="A focused surface for one capability, with a clear icon and a supporting action."
                    icon={<Sparkles />}
                    eyebrow="SPECIMEN"
                    action={
                      <Button
                        variant="ghost"
                        trailingIcon={<ArrowRight size={16} />}
                        onClick={() => notify('Feature card action')}
                      >
                        Explore pattern
                      </Button>
                    }
                  />
                  <ServiceCard
                    title="Service card"
                    description="A blue accent creates emphasis without competing with the content."
                    icon={<Cloud />}
                    eyebrow="SPECIMEN"
                    action={
                      <Button
                        variant="ghost"
                        trailingIcon={<ArrowRight size={16} />}
                        onClick={() => notify('Service card action')}
                      >
                        Explore pattern
                      </Button>
                    }
                  />
                  <IndustryCard
                    title="Industry card"
                    description="A quieter background gives related content its own place in the system."
                    icon={<Cpu />}
                    href="#composition"
                    linkLabel="Explore pattern"
                  />
                </div>
                <div className="ds-grid-3 ds-gap-top">
                  <StatCard
                    value="44 px"
                    label="Minimum action target"
                    detail="Design specification, not a business statistic."
                    development
                    developmentLabel="DESIGN SPECIMEN"
                  />
                  <StatCard
                    value="4 px"
                    label="Base spacing unit"
                    detail="A shared rhythm across the interface."
                    development
                    developmentLabel="DESIGN SPECIMEN"
                  />
                  <Card>
                    <Badge tone="blue">Base card</Badge>
                    <h3 className="tv-h3 ds-gap-top">A flexible foundation.</h3>
                    <p className="tv-description ds-gap-top">
                      Compose content, actions, and media without duplicating surface styles.
                    </p>
                  </Card>
                </div>
              </Section>

              <Section id="forms" spacing="compact">
                <SectionHeader
                  eyebrow="06 / COMPONENTS"
                  title="Thoughtful by default."
                  description="Visible labels, helpful context, clear validation, and comfortable touch targets."
                />
                <div className="ds-grid-2">
                  <Specimen title="INPUT STATES">
                    <div className="ds-stack">
                      <Input label="Default input" placeholder="Enter a value" />
                      <Input
                        label="With supporting text"
                        hint="A useful explanation belongs close to the field."
                        placeholder="Type here…"
                      />
                      <Input
                        label="Error example"
                        defaultValue="not-an-email"
                        error="Enter a valid email address."
                      />
                      <Input label="Disabled input" placeholder="Not available" disabled />
                      <Input label="Read-only input" value="TEVONIQ" readOnly />
                      <Select label="Select a component" defaultValue="">
                        <option value="" disabled>
                          Choose an option
                        </option>
                        <option>Buttons</option>
                        <option>Cards</option>
                        <option>Navigation</option>
                        <option disabled>Coming later</option>
                      </Select>
                    </div>
                  </Specimen>
                  <Specimen title="VALIDATED FORM / REACT HOOK FORM + ZOD">
                    <DemoForm notify={notify} />
                  </Specimen>
                </div>
                <div className="ds-grid-3 ds-gap-top">
                  <Specimen title="CHECKBOX">
                    <Checkbox label="Default checkbox" />
                    <Checkbox label="Selected checkbox" defaultChecked />
                    <Checkbox label="Disabled checkbox" disabled />
                    <Checkbox label="Required example" error="Select this option to continue." />
                  </Specimen>
                  <Specimen title="RADIO">
                    <fieldset className="ds-fieldset">
                      <legend className="tv-sr-only">Choose a layout</legend>
                      <Radio name="layout" value="comfortable" label="Comfortable" defaultChecked />
                      <Radio name="layout" value="compact" label="Compact" />
                      <Radio name="layout" value="disabled" label="Unavailable" disabled />
                    </fieldset>
                  </Specimen>
                  <Specimen title="SWITCH">
                    <Switch
                      label="Enable preview"
                      description="Controlled interaction example."
                      checked={exampleSwitch}
                      onChange={(event) => setExampleSwitch(event.target.checked)}
                    />
                    <Switch label="Default off" />
                    <Switch label="Disabled switch" disabled />
                    <p className="tv-field-hint">Preview is {exampleSwitch ? 'on' : 'off'}.</p>
                  </Specimen>
                </div>
              </Section>

              <Section id="navigation" spacing="compact">
                <SectionHeader
                  eyebrow="07 / COMPONENTS"
                  title="A sense of direction."
                  description="Navigation that adapts to its surface, screen, and reading direction."
                />
                <Specimen title="THEME-AWARE NAVIGATION">
                  <Navigation
                    theme={theme}
                    logo={
                      <Logo
                        size="sm"
                        label="TEVONIQ"
                        image={<BrandImage asset={brandAssets.icons.brand} alt="TEVONIQ" />}
                      />
                    }
                    items={[
                      { label: 'Overview', href: '#overview', active: true },
                      { label: 'Components', href: '#buttons' },
                      { label: 'Patterns', href: '#composition' },
                    ]}
                    actions={
                      <ButtonLink href="/en" size="sm">
                        Live header
                        <ArrowUpRight size={14} />
                      </ButtonLink>
                    }
                    label="Example navigation"
                    menuTitle="Open example menu"
                    menuDescription="Navigate the design specimens."
                    closeLabel="Close example menu"
                  />
                </Specimen>
                <div className="ds-grid-2 ds-gap-top">
                  <Specimen title="BREADCRUMB">
                    <Breadcrumb
                      label="Example breadcrumb"
                      items={[
                        { label: 'Design system', href: '#overview' },
                        { label: 'Components', href: '#buttons' },
                        { label: 'Navigation' },
                      ]}
                    />
                  </Specimen>
                  <Specimen title="PAGINATION">
                    <Pagination
                      page={page}
                      totalPages={8}
                      onPageChange={setPage}
                      labels={{
                        navigation: 'Example pagination',
                        previous: 'Previous page',
                        next: 'Next page',
                        page: (number) => 'Page ' + number,
                      }}
                    />
                    <p className="tv-field-hint ds-gap-top">
                      Page {page} of 8 · demonstration only
                    </p>
                  </Specimen>
                </div>
                <div className="ds-header-note">
                  <ShieldCheck size={19} />
                  <p>
                    The complete website header includes mega menus, search, language switching, and
                    a mobile drawer.
                  </p>
                  <ButtonLink href="/en" variant="outline" size="sm">
                    Preview header
                    <ArrowUpRight size={14} />
                  </ButtonLink>
                </div>
              </Section>

              <Section id="disclosure" spacing="compact">
                <SectionHeader
                  eyebrow="08 / COMPONENTS"
                  title="Reveal what matters."
                  description="Progressive disclosure with familiar keyboard behavior."
                />
                <div className="ds-grid-2">
                  <Specimen title="TABS">
                    <Tabs
                      label="Example component tabs"
                      value={tab}
                      onValueChange={setTab}
                      items={[
                        {
                          value: 'overview',
                          label: 'Overview',
                          content: (
                            <div className="ds-tab-content">
                              <Layers3 size={27} />
                              <h3 className="tv-h3">One system. Many possibilities.</h3>
                              <p className="tv-description">
                                Use arrow keys to move between tabs, or select a label.
                              </p>
                            </div>
                          ),
                        },
                        {
                          value: 'details',
                          label: 'Details',
                          content: (
                            <p className="tv-description">
                              Controlled tabs preserve the selected view in application state.
                            </p>
                          ),
                        },
                        { value: 'disabled', label: 'Disabled', content: null, disabled: true },
                      ]}
                    />
                  </Specimen>
                  <Specimen title="ACCORDION">
                    <Accordion
                      items={[
                        {
                          value: 'principles',
                          title: 'What guides the visual language?',
                          content: 'Clarity, restraint, and a consistent TEVONIQ identity.',
                        },
                        {
                          value: 'keyboard',
                          title: 'How does keyboard navigation work?',
                          content:
                            'Use Tab to focus a trigger, Enter or Space to toggle it, and arrow keys to move between triggers.',
                        },
                        {
                          value: 'disabled',
                          title: 'Disabled accordion item',
                          content: null,
                          disabled: true,
                        },
                      ]}
                    />
                  </Specimen>
                </div>
              </Section>

              <Section id="overlays" spacing="compact">
                <SectionHeader
                  eyebrow="09 / COMPONENTS"
                  title="Focus, without friction."
                  description="Accessible layers that keep context and return focus when dismissed."
                />
                <div className="ds-grid-3">
                  <Specimen title="MODAL">
                    <Modal
                      open={modal}
                      onOpenChange={setModal}
                      trigger={<Button variant="outline">Open modal</Button>}
                      title="A focused conversation"
                      description="This is a development modal specimen."
                      closeLabel="Close modal"
                      footer={
                        <>
                          <Button variant="ghost" onClick={() => setModal(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              setModal(false);
                              notify('Confirmed', 'No data was changed.');
                            }}
                          >
                            Confirm
                          </Button>
                        </>
                      }
                    >
                      <Input label="Example name" placeholder="Give this specimen a name" />
                      <p className="tv-description ds-gap-top">
                        Focus stays inside this dialog. Escape closes it and restores focus to the
                        trigger.
                      </p>
                    </Modal>
                  </Specimen>
                  <Specimen title="DRAWER">
                    <Drawer
                      open={drawer}
                      onOpenChange={setDrawer}
                      trigger={<Button variant="outline">Open drawer</Button>}
                      title="A little more context"
                      description="A slide-in panel for a focused task."
                      closeLabel="Close drawer"
                      footer={<Button onClick={() => setDrawer(false)}>Done</Button>}
                    >
                      <div className="ds-stack">
                        <Input label="Panel title" placeholder="Your title" />
                        <Textarea label="Panel notes" placeholder="Add a note…" />
                        <Checkbox label="Keep this preference" />
                      </div>
                    </Drawer>
                  </Specimen>
                  <Specimen title="DROPDOWN">
                    <Dropdown
                      label="Specimen actions"
                      trigger={
                        <Button variant="outline" trailingIcon={<MoreHorizontal size={18} />}>
                          Open actions
                        </Button>
                      }
                      items={[
                        {
                          id: 'copy',
                          label: 'Copy example',
                          icon: <Copy size={16} />,
                          onSelect: () => notify('Example copied'),
                        },
                        {
                          id: 'download',
                          label: 'Export unavailable',
                          icon: <Download size={16} />,
                          disabled: true,
                          onSelect: () => {},
                        },
                        {
                          id: 'reset',
                          label: 'Reset preview',
                          icon: <X size={16} />,
                          danger: true,
                          onSelect: () => {
                            setTheme('light');
                            setLanguage('en');
                            notify('Preview reset');
                          },
                        },
                      ]}
                    />
                  </Specimen>
                </div>
                <div className="ds-grid-2 ds-gap-top">
                  <Specimen title="TOOLTIP">
                    <div className="ds-row">
                      <Tooltip content="A concise explanation, available on hover or keyboard focus.">
                        <IconButton variant="outline" label="More information">
                          <Sparkles size={18} />
                        </IconButton>
                      </Tooltip>
                      <p className="tv-description">Hover or focus the icon.</p>
                    </div>
                  </Specimen>
                  <Specimen title="TOAST">
                    <Button
                      leadingIcon={<Check size={17} />}
                      variant="outline"
                      onClick={() =>
                        notify(
                          'A considered confirmation',
                          'Feedback that is clear, brief, and dismissible.',
                        )
                      }
                    >
                      Show notification
                    </Button>
                  </Specimen>
                </div>
              </Section>

              <Section id="states" spacing="compact">
                <SectionHeader
                  eyebrow="10 / COMPONENTS"
                  title="Every state considered."
                  description="Loading, empty, and error states are part of the experience, not an afterthought."
                />
                <div className="ds-grid-3">
                  <Specimen title="SKELETON">
                    <div className="ds-stack">
                      <Skeleton label="Loading example content" className="ds-skeleton-media" />
                      <Skeleton />
                      <Skeleton className="ds-skeleton-short" />
                      <Skeleton className="ds-skeleton-button" />
                    </div>
                  </Specimen>
                  <Specimen title="EMPTY STATE">
                    <EmptyState
                      title="Nothing here yet"
                      description="Your content will appear here when it is available."
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => notify('Empty-state action')}
                        >
                          Add example
                        </Button>
                      }
                    />
                  </Specimen>
                  <Specimen title="ERROR STATE">
                    <ErrorState
                      title="Unable to load"
                      description="Keep the explanation clear and offer a useful next step."
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          loading={retrying}
                          onClick={() => {
                            setRetrying(true);
                            window.setTimeout(() => {
                              setRetrying(false);
                              notify('Retry complete', 'This is a simulated recovery.');
                            }, 800);
                          }}
                        >
                          Try again
                        </Button>
                      }
                    />
                  </Specimen>
                </div>
              </Section>

              <Section id="composition" spacing="compact">
                <SectionHeader
                  eyebrow="11 / PATTERNS"
                  title="Better, together."
                  description="Foundations and components working as one coherent interface."
                />
                <CTA
                  eyebrow="TEVONIQ / DESIGN SPECIMEN"
                  title="Build the next experience."
                  description="A reusable call to action with a calm navy surface and a precise gold accent."
                  actions={
                    <ButtonLink href="#brand">
                      Explore the system
                      <ArrowRight size={16} />
                    </ButtonLink>
                  }
                />
                <Section tone="muted" spacing="compact" className="ds-container-demo">
                  <Container width="narrow">
                    <SectionHeader
                      align="center"
                      eyebrow="CONTAINER + SECTION + SECTION HEADER"
                      title="A deliberate rhythm."
                      description="Content width, section spacing, and type hierarchy share the same foundations."
                    />
                  </Container>
                </Section>
              </Section>

              <Section id="brand" spacing="compact">
                <SectionHeader
                  eyebrow="12 / IDENTITY"
                  title="Always TEVONIQ."
                  description="Official assets, preserved exactly. No cropping, recoloring, or distortion."
                />
                <div className="ds-brand-grid">
                  <Specimen title="PRIMARY WORDMARK">
                    <div className="ds-logo-preview">
                      <BrandLogo />
                    </div>
                  </Specimen>
                  <Specimen title="HORIZONTAL LOCKUP">
                    <div className="ds-logo-preview">
                      <BrandLogo variant="horizontal" />
                    </div>
                  </Specimen>
                  <Specimen title="BRAND ICON">
                    <div className="ds-icon-preview">
                      <BrandImage asset={brandAssets.icons.brand} alt="TEVONIQ brand icon" />
                    </div>
                  </Specimen>
                </div>
                <p className="tv-field-hint ds-gap-top">
                  Light and monochrome variants have not been supplied. The official dark mark is
                  shown on a light surface as a safe fallback.
                </p>
              </Section>
              <footer className="ds-footer">
                <span>
                  TEVONIQ<span>PREMIUM TECHNOLOGY</span>
                </span>
                <p>A shared language for what comes next.</p>
                <a href="#overview">Back to top ↑</a>
              </footer>
            </div>
          </main>
        </div>
        <Toast
          open={toast.open}
          onOpenChange={(open) => setToast({ ...toast, open })}
          title={toast.title}
          description={toast.description}
          closeLabel="Dismiss notification"
        />
      </ToastProvider>
    </UIProvider>
  );
}
