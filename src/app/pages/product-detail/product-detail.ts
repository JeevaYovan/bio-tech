import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatINR } from '../../../data/products';
import { getProductView, type ProductView } from '../../../data/product-content';

const SITE_ORIGIN = 'https://rathika.in';

interface ImageBundle {
  readonly avifSrcset: string;
  readonly webpSrcset: string;
  readonly jpgSrcset: string;
  readonly fallback: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

interface ViewModel {
  readonly product: ProductView;
  readonly priceLabel: string;
  readonly waUrl: string;
  readonly image: ImageBundle | null;
}

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export default class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  protected readonly view = computed<ViewModel | null>(() => {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const product = getProductView(slug);
    if (!product) return null;
    const media = product.content.media;
    let image: ImageBundle | null = null;
    if (media.hasPhoto && media.imageSlug) {
      const base = `assets/${media.imageSlug}`;
      image = {
        avifSrcset: `${base}-400.avif 400w, ${base}-800.avif 800w`,
        webpSrcset: `${base}-400.webp 400w, ${base}-800.webp 800w`,
        jpgSrcset:  `${base}-400.jpg 400w, ${base}-800.jpg 800w`,
        fallback:   `${base}-800.jpg`,
        width:  media.intrinsic?.w ?? 400,
        height: media.intrinsic?.h ?? 400,
        alt: media.alt,
      };
    }
    const orderMsg = `Hi Rathika, I'd like to order: ${product.name} (${product.size})`;
    return {
      product,
      priceLabel: formatINR(product.price),
      waUrl: `https://wa.me/919080966792?text=${encodeURIComponent(orderMsg)}`,
      image,
    };
  });

  ngOnInit(): void {
    const vm = this.view();
    if (!vm) return;
    const { product } = vm;
    const desc = this.shortenDescription(product.content.description);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:title', content: `${product.name} (${product.size}) — Rathika Biotech` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    const imageUrl = product.content.media.hasPhoto
      ? `${SITE_ORIGIN}/assets/${product.content.media.imageSlug}-800.jpg`
      : `${SITE_ORIGIN}/assets/brand/logo-256.jpg`;
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:url', content: `${SITE_ORIGIN}/products/${product.slug}/` });
    this.upsertCanonical(`${SITE_ORIGIN}/products/${product.slug}/`);
    this.injectJsonLd('product', this.productSchema(product, imageUrl));
    this.injectJsonLd('breadcrumb', this.breadcrumbSchema(product));
  }

  ngOnDestroy(): void {
    this.removeJsonLd('product');
    this.removeJsonLd('breadcrumb');
    this.removeCanonical();
  }

  private shortenDescription(d: string): string {
    if (d.length <= 160) return d;
    const cut = d.slice(0, 157);
    const lastSpace = cut.lastIndexOf(' ');
    return cut.slice(0, lastSpace > 100 ? lastSpace : cut.length).trim() + '…';
  }

  private productSchema(p: ProductView, imageUrl: string) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      image: imageUrl,
      description: p.content.description,
      brand: { '@type': 'Brand', name: 'Rathika Biotech Products' },
      manufacturer: {
        '@type': 'Organization',
        name: 'Rathika Biotech Products',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '1/447 Avinashi Road',
          addressLocality: 'Neelambur',
          addressRegion: 'Tamil Nadu',
          postalCode: '641026',
          addressCountry: 'IN',
        },
      },
      sku: p.slug,
      category: p.category,
      material: p.content.material,
      offers: {
        '@type': 'Offer',
        url: `${SITE_ORIGIN}/products/${p.slug}/`,
        priceCurrency: 'INR',
        price: p.price.toFixed(2),
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'Rathika Biotech Products' },
      },
    };
  }

  private breadcrumbSchema(p: ProductView) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',     item: `${SITE_ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_ORIGIN}/products/` },
        { '@type': 'ListItem', position: 3, name: p.name,     item: `${SITE_ORIGIN}/products/${p.slug}/` },
      ],
    };
  }

  private injectJsonLd(kind: 'product' | 'breadcrumb', schema: object): void {
    const id = `jsonld-${kind}`;
    this.doc.getElementById(id)?.remove();
    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }

  private removeJsonLd(kind: 'product' | 'breadcrumb'): void {
    this.doc.getElementById(`jsonld-${kind}`)?.remove();
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

  private removeCanonical(): void {
    this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.remove();
  }
}
