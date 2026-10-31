import { useEffect } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
export const SITE_URL = 'https://trivinexpartners.com';
export const SITE_NAME = 'Trivinex Partners';
export const DEFAULT_TITLE = 'Trivinex Partners — Everything You Need, All in One Place';
export const DEFAULT_DESCRIPTION =
  'Trivinex Partners is a one-stop digital services company offering web development, video editing, content writing, photography, videography, and SEO — delivered worldwide by one trusted team at honest prices.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// ─── Helper: upsert a <meta> by selector ────────────────────────────────────
function setMeta(selector: string, attrName: string, value: string, attrKey?: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    if (attrKey) {
      const match = selector.match(/\[[\w:]+="([^"]+)"\]/);
      if (match) el.setAttribute(attrKey, match[1]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attrName, value);
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface SEOHeadProps {
  /** Short page title — " | Trivinex Partners" is appended automatically */
  title?: string;
  description?: string;
  /** Path relative to domain root, e.g. "/about" */
  canonical?: string;
  ogImage?: string;
  /** JSON-LD object(s) injected as <script type="application/ld+json"> */
  jsonLd?: object | object[];
  noIndex?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function SEOHead({
  title,
  description,
  canonical = '/',
  ogImage,
  jsonLd,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const canonicalUrl = `${SITE_URL}${canonical === '/' ? '' : canonical}`;
  const image = ogImage || DEFAULT_OG_IMAGE;
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = fullTitle;

    setMeta('meta[name="description"]', 'content', desc, 'name');
    setMeta('meta[name="robots"]',      'content', noIndex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large', 'name');

    // Open Graph
    setMeta('meta[property="og:title"]',       'content', fullTitle, 'property');
    setMeta('meta[property="og:description"]', 'content', desc,      'property');
    setMeta('meta[property="og:url"]',         'content', canonicalUrl, 'property');
    setMeta('meta[property="og:image"]',       'content', image,     'property');
    setMeta('meta[property="og:site_name"]',   'content', SITE_NAME, 'property');
    setMeta('meta[property="og:type"]',        'content', 'website', 'property');

    // Twitter / X
    setMeta('meta[name="twitter:card"]',        'content', 'summary_large_image', 'name');
    setMeta('meta[name="twitter:title"]',       'content', fullTitle, 'name');
    setMeta('meta[name="twitter:description"]', 'content', desc,      'name');
    setMeta('meta[name="twitter:image"]',       'content', image,     'name');

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevHref = link?.href ?? '';
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;

    // JSON-LD scripts (keyed so they replace on re-render)
    const scriptIds: string[] = [];
    if (jsonLdStr) {
      const schemas = JSON.parse(jsonLdStr) as object | object[];
      const arr = Array.isArray(schemas) ? schemas : [schemas];
      arr.forEach((schema, i) => {
        const id = `seo-jsonld-${i}`;
        scriptIds.push(id);
        let el = document.getElementById(id) as HTMLScriptElement | null;
        if (!el) {
          el = document.createElement('script');
          el.type = 'application/ld+json';
          el.id = id;
          document.head.appendChild(el);
        }
        el.textContent = JSON.stringify(schema);
      });
    }

    return () => {
      document.title = prevTitle;
      scriptIds.forEach((id) => document.getElementById(id)?.remove());
      if (link) link.href = prevHref;
    };
  }, [fullTitle, desc, canonicalUrl, image, noIndex, jsonLdStr]);

  return null;
}
