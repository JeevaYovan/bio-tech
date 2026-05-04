import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatINR } from '../../../data/products';
import {
  displayableProducts,
  getMedia,
  getProductView,
  type ProductView,
} from '../../../data/product-content';
import { SeoService, SITE_ORIGIN } from '../../services/seo.service';
import { whatsappOrderUrlForProduct } from '../../shared/constants';
import { HorizontalSliderComponent } from '../../shared/horizontal-slider/horizontal-slider';
import { HorizontalSliderItemDirective } from '../../shared/horizontal-slider/horizontal-slider-item.directive';

interface ImageBundle {
  readonly avifSrcset: string;
  readonly webpSrcset: string;
  readonly jpgSrcset: string;
  readonly fallback: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

interface RelatedItem {
  readonly slug: string;
  readonly name: string;
  readonly size: string;
  readonly priceLabel: string;
  readonly image: ImageBundle | null;
}

interface ViewModel {
  readonly product: ProductView;
  readonly priceLabel: string;
  readonly waUrl: string;
  readonly image: ImageBundle | null;
  readonly related: ReadonlyArray<RelatedItem>;
}

function buildImage(slug: string): ImageBundle | null {
  const media = getMedia(slug);
  if (!media?.hasPhoto || !media.imageSlug) return null;
  const base = `assets/${media.imageSlug}`;
  return {
    avifSrcset: `${base}-400.avif 400w, ${base}-800.avif 800w`,
    webpSrcset: `${base}-400.webp 400w, ${base}-800.webp 800w`,
    jpgSrcset:  `${base}-400.jpg 400w, ${base}-800.jpg 800w`,
    fallback:   `${base}-800.jpg`,
    width:  media.intrinsic?.w ?? 400,
    height: media.intrinsic?.h ?? 400,
    alt: media.alt,
  };
}

@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HorizontalSliderComponent, HorizontalSliderItemDirective],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export default class ProductDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly view = computed<ViewModel | null>(() => {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const product = getProductView(slug);
    if (!product) return null;
    const image = buildImage(product.slug);

    /* Related = same-category, displayable, excluding self. Up to 4. */
    const related: ReadonlyArray<RelatedItem> = displayableProducts
      .filter((p) => p.category === product.category && p.slug !== product.slug)
      .slice(0, 4)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        size: p.size,
        priceLabel: formatINR(p.price),
        image: buildImage(p.slug),
      }));

    return {
      product,
      priceLabel: formatINR(product.price),
      waUrl: whatsappOrderUrlForProduct(product.name, product.size),
      image,
      related,
    };
  });

  ngOnInit(): void {
    const vm = this.view();
    if (!vm) return;
    const { product } = vm;
    const ogImage = product.content.media.hasPhoto
      ? `assets/${product.content.media.imageSlug}-800.jpg`
      : 'assets/brand/logo-256.png';

    this.seo.applyRouteSeo({
      description: product.content.description,
      canonicalPath: `/products/${product.slug}/`,
      ogImage,
      ogType: 'product',
      ogTitle: `${product.name} (${product.size}) — Rathika Biotech`,
    });

    const fullImageUrl = `${SITE_ORIGIN}/${ogImage}`;
    this.seo.injectJsonLd('jsonld-product', this.productSchema(product, fullImageUrl));
    this.seo.injectJsonLd('jsonld-breadcrumb', this.breadcrumbSchema(product));
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('jsonld-product');
    this.seo.removeJsonLd('jsonld-breadcrumb');
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
}
