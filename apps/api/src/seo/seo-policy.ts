/** Keep the SEO inventory aligned with public article routing without changing stored CMS paths. */
export function publicSeoPath(path: string, type: string, locale: string) {
  return type === 'resource' && locale !== 'tr'
    ? path.replace(/^\/insights\/blog\//, '/insights/resources/')
    : path;
}
