/**
 * Per-route SEO + structured data.
 *
 * Used by:
 *   - App (root) component → applyRootJsonLd() once at init for the
 *     site-wide Organization + LocalBusiness JSON-LD blocks.
 *   - Each page component → applyRouteSeo({ description, canonicalPath, ... })
 *     in ngOnInit to set meta description, canonical link, OG/Twitter
 *     tags, and og:image.
 *
 * Works at prerender time (DOCUMENT is the SSR document) and on
 * client-side hydration / route changes (deduped by element id).
 */

import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export const SITE_ORIGIN = 'https://rathika.in';
export const DEFAULT_OG_IMAGE = 'assets/og/og-default.jpg';

export type OgType = 'website' | 'article' | 'product';

export interface RouteSeo {
  /** Plain-text route description; trimmed to ~160 chars for meta description. */
  readonly description: string;
  /** Path with leading + trailing slash, e.g. '/about/' or '/products/tea-cup-100ml/'. */
  readonly canonicalPath: string;
  /** Path to OG image relative to site root; defaults to assets/og/og-default.jpg. */
  readonly ogImage?: string;
  readonly ogType?: OgType;
  /** Page-specific og:title (defaults to <title>). */
  readonly ogTitle?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  /** Site-wide Organization + LocalBusiness JSON-LD. Idempotent. */
  applyRootJsonLd(): void {
    this.injectJsonLd('jsonld-org', this.organizationSchema());
    this.injectJsonLd('jsonld-local-business', this.localBusinessSchema());
  }

  applyRouteSeo(seo: RouteSeo): void {
    const desc = this.shorten(seo.description, 160);
    const url = `${SITE_ORIGIN}${seo.canonicalPath}`;
    const imageUrl = `${SITE_ORIGIN}/${seo.ogImage ?? DEFAULT_OG_IMAGE}`;

    this.meta.updateTag({ name: 'description', content: desc });
    this.upsertCanonical(url);

    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: seo.ogType ?? 'website' });
    if (seo.ogTitle) this.meta.updateTag({ property: 'og:title', content: seo.ogTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Rathika Biotech Products' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    if (seo.ogTitle) this.meta.updateTag({ name: 'twitter:title', content: seo.ogTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
  }

  /** Optionally remove a per-route JSON-LD block by id (used by detail pages). */
  removeJsonLd(id: string): void {
    this.doc.getElementById(id)?.remove();
  }

  /** Inject (or replace) a JSON-LD <script> block in <head>. */
  injectJsonLd(id: string, schema: object): void {
    this.doc.getElementById(id)?.remove();
    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  private upsertCanonical(href: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = href;
  }

  private shorten(text: string, max: number): string {
    if (text.length <= max) return text;
    const cut = text.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
  }

  private organizationSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Rathika Biotech Products',
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/assets/brand/logo-256.jpg`,
      sameAs: [],
      address: this.postalAddress(),
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-90809-66792',
        email: 'rathikabiotechproducts@gmail.com',
        contactType: 'sales',
        areaServed: ['IN'],
        availableLanguage: ['en', 'ta'],
      },
    };
  }

  private localBusinessSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Rathika Biotech Products',
      image: `${SITE_ORIGIN}/${DEFAULT_OG_IMAGE}`,
      logo: `${SITE_ORIGIN}/assets/brand/logo-256.jpg`,
      url: SITE_ORIGIN,
      telephone: '+91-90809-66792',
      email: 'rathikabiotechproducts@gmail.com',
      priceRange: '₹₹',
      address: this.postalAddress(),
      geo: { '@type': 'GeoCoordinates', latitude: 11.0779, longitude: 77.0006 },
      areaServed: ['Coimbatore', 'Tamil Nadu', 'India'],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
    };
  }

  private postalAddress() {
    return {
      '@type': 'PostalAddress',
      streetAddress: '1/447 Avinashi Road',
      addressLocality: 'Neelambur',
      addressRegion: 'Tamil Nadu',
      postalCode: '641026',
      addressCountry: 'IN',
    };
  }
}
