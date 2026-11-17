export const defaultSiteOrigin = 'https://mablle-interior.vercel.app';

export function siteOrigin(env = {}) {
  const configured = env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || defaultSiteOrigin;
  const url = new URL(configured.includes('://') ? configured : `https://${configured}`);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('SITE_URL must be a public HTTPS website URL without credentials.');
  return url.origin;
}

// Build-time substitution keeps sharing metadata available without React/JS.
export function socialPreviewPlugin(env) {
  const origin = siteOrigin(env);
  return {
    name: 'mablle-social-preview-origin',
    transformIndexHtml(html) { return html.replaceAll(defaultSiteOrigin, origin); },
  };
}
