export function renderEnvironment(input = process.env) {
  const site = new URL(input.SITE_URL || input.RENDER_EXTERNAL_URL || 'http://localhost:3000');
  if (
    site.origin !== site.href.replace(/\/$/, '') ||
    site.username ||
    site.password ||
    site.search ||
    site.hash
  )
    throw new Error('SITE_URL must be an exact browser origin');
  if (input.RENDER === 'true' && site.protocol !== 'https:')
    throw new Error('Render requires an HTTPS public origin');
  const port = input.PORT || '10000';
  const apiPort = input.PREVIEW_API_PORT || '4000';
  if (
    !/^\d+$/.test(port) ||
    Number(port) < 1 ||
    Number(port) > 65535 ||
    Number(port) === Number(apiPort)
  )
    throw new Error('Choose a valid public PORT different from the private API port');
  if (!/^\d+$/.test(apiPort) || Number(apiPort) < 1 || Number(apiPort) > 65535)
    throw new Error('Invalid private API port');
  return {
    ...input,
    NODE_ENV: 'production',
    SITE_URL: site.origin,
    CORS_ORIGIN: site.origin,
    API_URL: `http://127.0.0.1:${apiPort}/api/v1`,
    PREVIEW_API_PORT: apiPort,
    API_BIND_HOST: '127.0.0.1',
    PORT: port,
    NEXT_TELEMETRY_DISABLED: '1',
  };
}
