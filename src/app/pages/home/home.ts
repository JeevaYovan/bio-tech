import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChildren,
  QueryList,
  inject,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { findProductBySlug, formatINR, type Product, type ProductCategory } from '../../../data/products';
import { SeoService } from '../../services/seo.service';
import { WA_URL } from '../../shared/constants';
import { HorizontalSliderComponent } from '../../shared/horizontal-slider/horizontal-slider';
import { HorizontalSliderItemDirective } from '../../shared/horizontal-slider/horizontal-slider-item.directive';

interface CategoryCard {
  readonly key: ProductCategory;
  readonly label: string;
  readonly eyebrow: string;
  readonly imageSlug: string;
  readonly alt: string;
  /** Token for the per-card cream-variation tint (REBUILD §10b). */
  readonly tint: string;
}

interface HowStep {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  readonly imageSlug: string;
  readonly alt: string;
  readonly intrinsic: { w: number; h: number };
}

interface FeaturedSpec {
  slug: string;
  imageSlug: string;
  alt: string;
  intrinsic: { w: number; h: number };
}

interface Featured extends Product {
  imageSlug: string;
  alt: string;
  intrinsic: { w: number; h: number };
  avifSrcset: string;
  webpSrcset: string;
  jpgSrcset: string;
  fallback: string;
}

interface Pillar {
  n: string;
  title: string;
  body: string;
}

const FEATURED_SPECS: ReadonlyArray<FeaturedSpec> = [
  { slug: 'tea-cup-100ml',        imageSlug: 'products/tea-cup-100ml',        alt: 'Three biodegradable bagasse tea cups stacked on a stone surface',          intrinsic: { w: 400, h: 534 } },
  { slug: 'parcel-box-300ml',     imageSlug: 'products/parcel-box-300ml',     alt: 'Round 300 ml biodegradable parcel box with lid on a desk',                  intrinsic: { w: 400, h: 300 } },
  { slug: 'partition-10x12',      imageSlug: 'products/partition-10x12',      alt: 'Stack of 10 by 12 inch partition plates with embossed Rathika logo',        intrinsic: { w: 400, h: 469 } },
  { slug: 'rectangle-box-300ml',  imageSlug: 'products/rectangle-box-300ml',  alt: 'Rectangular biodegradable parcel box with a bagasse spoon inside',          intrinsic: { w: 400, h: 300 } },
  { slug: 'spoon-5in',            imageSlug: 'products/spoon-5in',            alt: 'Row of nested five-inch biodegradable spoons',                              intrinsic: { w: 400, h: 300 } },
  { slug: 'vinayagar-statue-6in', imageSlug: 'products/vinayagar-statue-6in', alt: 'Six-inch Vinayagar statue seated in a bagasse bowl',                        intrinsic: { w: 400, h: 425 } },
];

function buildFeatured(spec: FeaturedSpec): Featured | null {
  const product = findProductBySlug(spec.slug);
  if (!product) {
    console.warn(`[home] Featured slug not found: ${spec.slug} — skipping`);
    return null;
  }
  const base = `assets/${spec.imageSlug}`;
  return {
    ...product,
    imageSlug: spec.imageSlug,
    alt: spec.alt,
    intrinsic: spec.intrinsic,
    avifSrcset: `${base}-400.avif 400w, ${base}-800.avif 800w`,
    webpSrcset: `${base}-400.webp 400w, ${base}-800.webp 800w`,
    jpgSrcset:  `${base}-400.jpg 400w, ${base}-800.jpg 800w`,
    fallback:   `${base}-400.jpg`,
  };
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HorizontalSliderComponent, HorizontalSliderItemDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class HomeComponent implements OnInit, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly waUrl = WA_URL;

  /** Animation #4 — first-viewport reveal on these section roots. */
  @ViewChildren('reveal') protected revealRefs!: QueryList<ElementRef<HTMLElement>>;

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Rathika Biotech Products — biodegradable plates, bowls, cups, and spoons made from banana fiber, sugarcane bagasse, and rice husk. Manufactured in Neelambur, Coimbatore.',
      canonicalPath: '/',
      ogTitle: 'Rathika Biotech Products | Biodegradable Tableware, Coimbatore',
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback — show everything for users on older browsers without IO.
      this.revealRefs.forEach((r) => r.nativeElement.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            observer.unobserve(e.target); // animation #4: once only.
          }
        }
      },
      { rootMargin: '0px 0px -10%', threshold: 0.1 },
    );
    this.revealRefs.forEach((r) => io.observe(r.nativeElement));
    this.destroyRef.onDestroy(() => io.disconnect());
  }

  /** REBUILD §9 home trust strip — claims must be real, not fabricated. */
  protected readonly trustClaims: ReadonlyArray<string> = [
    'Made in Coimbatore',
    '100% Biodegradable',
    'Chemical-free, food-safe',
    'Bulk orders welcome',
    'Compostable in 30 days',
  ];

  /** REBUILD §10b — six categories, cream-variation tints. */
  protected readonly categories: ReadonlyArray<CategoryCard> = [
    { key: 'plates',   label: 'Plates',        eyebrow: 'Tableware',  imageSlug: 'products/partition-10x12',      alt: 'Partition plates stacked, embossed mark on top', tint: '#E8F0E5' },
    { key: 'bowls',    label: 'Bowls',         eyebrow: 'Tableware',  imageSlug: 'products/ice-cream-bowl-4in',   alt: 'Multi-coloured 4-inch ice cream bowls',          tint: '#EFE8DA' },
    { key: 'cups',     label: 'Cups',          eyebrow: 'Beverage',   imageSlug: 'products/tea-cup-100ml',        alt: 'Stacked 100 ml bagasse tea cups',                 tint: '#E5EBE0' },
    { key: 'boxes',    label: 'Parcel boxes',  eyebrow: 'Takeaway',   imageSlug: 'products/parcel-box-300ml',     alt: 'Round 300 ml parcel box with lid',                tint: '#F0EAD6' },
    { key: 'utensils', label: 'Utensils',      eyebrow: 'Cutlery',    imageSlug: 'products/spoon-5in',            alt: 'Row of nested 5-inch spoons',                     tint: '#E8EDDB' },
    { key: 'decor',    label: 'Decor',         eyebrow: 'Ceremonial', imageSlug: 'products/vinayagar-statue-6in', alt: 'Six-inch Vinayagar statue in a bagasse bowl',     tint: '#EDE4D3' },
  ];

  /** REBUILD §9 home — three-step "How it's made". */
  protected readonly howSteps: ReadonlyArray<HowStep> = [
    {
      n: '01',
      title: 'Source from harvest waste',
      body:
        'Banana stems, sugarcane bagasse, and rice husk arrive from farms across Tamil Nadu — agricultural by-products that would otherwise be burned in the open.',
      imageSlug: 'lifestyle/story-fiber-texture',
      alt: 'Macro of natural fiber texture showing rice husk and bagasse strands',
      intrinsic: { w: 600, h: 484 },
    },
    {
      n: '02',
      title: 'Press into form',
      body:
        'Fibers are mixed with food-safe plant binder and pressed in heated moulds. No paint, no plastic film, no chemical sealer — just heat, pressure, and natural starch.',
      imageSlug: 'workshop/packing-partition-plates',
      alt: 'Open cardboard carton of partition plates fresh from production',
      intrinsic: { w: 400, h: 300 },
    },
    {
      n: '03',
      title: 'Finished, then composted',
      body:
        'The finished tableware is rigid, food-safe, and embossed with the Rathika mark. Once discarded outdoors, each piece composts cleanly within four to six weeks.',
      imageSlug: 'workshop/bowls-cluster-sunlit',
      alt: 'Cluster of finished bagasse bowls with spoons in afternoon sunlight',
      intrinsic: { w: 400, h: 300 },
    },
  ];

  protected readonly featured: ReadonlyArray<Featured> =
    FEATURED_SPECS.map(buildFeatured).filter((x): x is Featured => x !== null);

  protected readonly pillars: ReadonlyArray<Pillar> = [
    { n: '01', title: '100% Natural & Biodegradable', body: 'Made entirely from banana fiber, sugarcane bagasse, and rice husk — no plastics, no chemicals, no coatings. Decomposes safely in weeks.' },
    { n: '02', title: 'Strong & Durable',             body: 'Natural fiber tensile strength makes these sturdy enough for hot, cold, and oily food without bending or leaking.' },
    { n: '03', title: 'Chemical-Free & Food Safe',    body: 'No synthetic binders, adhesives, or coatings. Safe for direct contact with food and ideal for eco-conscious kitchens.' },
    { n: '04', title: 'Heat & Moisture Resistant',    body: 'Holds curries, gravies, and hot beverages without leaking. The natural fiber structure insulates well.' },
    { n: '05', title: 'Zero-Waste Manufacturing',     body: 'Built from agricultural by-products that would otherwise be burned. Low carbon footprint, circular economy.' },
    { n: '06', title: 'Animal-Friendly & Compostable',body: 'Discarded outdoors, animals can safely consume it. No soil or water pollution. Returns cleanly to the earth.' },
  ];

  protected readonly whereUsed: ReadonlyArray<string> = [
    'Restaurants', 'Cafés', 'Food trucks', 'Events', 'Weddings',
    'Festivals',   'Fruit shops', 'Organic stores', 'Eco-friendly markets', 'Home',
  ];

  protected readonly formatPrice = formatINR;
}
