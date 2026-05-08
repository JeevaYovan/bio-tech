import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  formatINR,
  productCategories,
  type ProductCategory,
} from '../../../data/products';
import { displayableProducts, getMedia, getProductView } from '../../../data/product-content';
import { SeoService } from '../../services/seo.service';
import { WA_URL, whatsappOrderUrlForProduct } from '../../shared/constants';
import { HorizontalSliderComponent } from '../../shared/horizontal-slider/horizontal-slider';
import { HorizontalSliderItemDirective } from '../../shared/horizontal-slider/horizontal-slider-item.directive';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ProductFlipCardComponent, type FlipCardData } from '../../shared/product-flip-card/product-flip-card';
import { FaqAccordionComponent, type FaqItem } from '../../shared/faq-accordion/faq-accordion';
import { MagneticDirective } from '../../shared/magnetic/magnetic.directive';
import { NatureParallaxHeroComponent } from '../../shared/nature-parallax-hero/nature-parallax-hero';
import { KineticTextDirective } from '../../shared/kinetic-text/kinetic-text.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

type Filter = 'all' | ProductCategory;

const titleCase = (s: string): string => s[0].toUpperCase() + s.slice(1);

/** Catalog item — superset of the flip-card shape so a single record
 *  drives both the featured slider and the main grid. */
interface CatalogItem extends FlipCardData {
  readonly category: ProductCategory;
}

/** Compost time defaults by category. The reference range from PROMPT
 *  text is "four to six weeks" — we pick a per-category midpoint so
 *  each card shows a concrete number on the back face. */
const COMPOST_DAYS: Record<ProductCategory, number> = {
  cups:     28,
  plates:   35,
  bowls:    30,
  boxes:    30,
  utensils: 35,
  decor:    42,
};

/** Take the first sentence of a description (period or em-dash). Used
 *  as the short summary on the back of the flip card. */
function firstSentence(text: string | undefined, fallback: string): string {
  if (!text) return fallback;
  const m = text.match(/^[^.!?—]+[.!?]/);
  return m ? m[0].trim() : text.split(/\s+/).slice(0, 24).join(' ') + '…';
}

interface FilterTab {
  readonly value: Filter;
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HorizontalSliderComponent,
    HorizontalSliderItemDirective,
    SectionBadgeComponent,
    RevealOnScrollDirective,
    ProductFlipCardComponent,
    FaqAccordionComponent,
    MagneticDirective,
    NatureParallaxHeroComponent,
    KineticTextDirective,
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export default class CatalogComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly filter = signal<Filter>('all');
  protected readonly query = signal<string>('');
  /** Generic "ask about anything not visible" WA prefill — used in the
      catalog header so buyers know SKUs without studio photos can still
      be ordered (PROMPT.md §11 lists 14, only 8 have photos right now). */
  protected readonly askUrl = WA_URL;
  /** Tracks first emission of queryParams so we don't scroll on initial
      navigation (Angular's scrollPositionRestoration already does that
      for full route changes). We only scroll when query params change
      *while staying on /products* — e.g. clicking a footer category. */
  private firstParam = true;

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Full catalog of Rathika Biotech biodegradable tableware — plates, bowls, cups, spoons, parcel boxes, and decorative statues. INR pricing. Bulk orders welcome on WhatsApp.',
      canonicalPath: '/products/',
      ogTitle: 'Eco-Friendly Plates, Cups & Bowls | Rathika Biotech Coimbatore',
    });

    /* Pick up the ?category=plates query param so the category cards on
       Home, the footer Catalog column, and any deep link pre-filter
       the catalog. We also clear the search and scroll to top when the
       category changes mid-session — without this, clicking a footer
       category from the bottom of /products silently swaps the chip
       but the user is still parked at the bottom and thinks nothing
       happened. */
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const cat = params.get('category');
        const validCat =
          cat && (productCategories as readonly string[]).includes(cat)
            ? (cat as ProductCategory)
            : 'all';
        const changed = this.filter() !== validCat;
        this.filter.set(validCat);
        if (changed) this.query.set('');
        if (!this.firstParam && changed && isPlatformBrowser(this.platformId)) {
          const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        }
        this.firstParam = false;
      });
  }

  protected readonly filterTabs: ReadonlyArray<FilterTab> = (() => {
    const all: FilterTab = { value: 'all', label: 'All', count: displayableProducts.length };
    const byCat = productCategories.map<FilterTab>((c) => ({
      value: c,
      label: titleCase(c),
      count: displayableProducts.filter((p) => p.category === c).length,
    }));
    return [all, ...byCat];
  })();

  /** All catalog items (no filter, no search) — used by the featured slider. */
  protected readonly allItems = computed<ReadonlyArray<CatalogItem>>(() =>
    displayableProducts.map((p) => this.toItem(p)),
  );

  protected readonly visibleProducts = computed<ReadonlyArray<CatalogItem>>(() => {
    const f = this.filter();
    const q = this.query().trim().toLowerCase();
    let list = this.allItems();
    if (f !== 'all') list = list.filter((p) => p.category === f);
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return list;
  });

  protected setFilter(value: Filter): void {
    /* Sync filter to the URL — keeps back/forward + share links in
       sync with the chip state. queryParams replace mode prevents the
       history stack from filling with one entry per chip click. */
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: value === 'all' ? null : value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected setQuery(value: string): void {
    this.query.set(value);
  }

  protected readonly revealDelayFor = revealDelayFor;

  /** Product-focused FAQ shown at the bottom of the catalog page. */
  protected readonly productFaqs: ReadonlyArray<FaqItem> = [
    {
      q: 'What materials do you press from?',
      a: 'Four agricultural by-products: banana fiber from the pseudo-stem, sugarcane bagasse from local sugar mills, rice husk and rice straw from paddy. Every input is sourced from farms and mills within Tamil Nadu.',
    },
    {
      q: 'Are the products biodegradable and compostable?',
      a: 'Yes, both. Discarded outdoors, every piece breaks down in roughly 30 days. In a commercial composter the cycle is 2–3 weeks. There is no synthetic liner or chemical sealer to slow it down.',
    },
    {
      q: 'How long does composting take?',
      a: 'About 30 days in open soil outdoors. 2–3 weeks in a commercial composter. Pieces left dry indoors stay intact indefinitely — the breakdown only kicks in once they meet moisture and microbes.',
    },
    {
      q: 'Are they safe for hot and cold food?',
      a: 'Yes. Plates, bowls, cups, and parcel boxes are rated for hot, oily, and saucy food at typical Indian serving temperatures. The natural fiber walls insulate the contents and resist gravy soak-through for the duration of a meal.',
    },
    {
      q: 'Microwave and freezer safe?',
      a: 'Yes for short-burst microwave heating and freezer storage. Avoid sustained high-heat cycles above 160°C — the binder is plant starch.',
    },
    {
      q: 'Are they reusable?',
      a: 'Designed for single use. A light wipe-and-reuse for dry food (snacks, dessert) is fine, but the products aren\'t dishwasher rated.',
    },
    {
      q: 'Can we get custom embossing for events or businesses?',
      a: 'Yes. Custom embossing is available on bulk orders above 5,000 units. Message us on WhatsApp with the size, quantity, and event date for a quote.',
    },
    {
      q: 'Where can I buy?',
      a: 'Direct via WhatsApp for bulk orders, the wholesale form for catered events, weddings, and festival vendors, or the contact form for general enquiries. We don\'t run a retail storefront yet — every order is fulfilled from the Neelambur workshop.',
    },
    {
      q: 'How do they compare to plastic tableware?',
      a: 'Roughly 90% lower manufacturing carbon footprint. 30 days to compost versus ~500 years for plastic. No microplastic shedding into food or soil. Safe for animals to consume if discarded outdoors.',
    },
    {
      q: 'Will they hold up like plastic?',
      a: 'Rigid for the duration of a meal, including curries and gravies. The fiber doesn\'t bend or leak under typical serving load. Heavier-duty options like the 10×12 partition plate hold a full thali.',
    },
  ];

  private toItem(p: { slug: string; name: string; size: string; price: number; category: ProductCategory }): CatalogItem {
    const media = getMedia(p.slug);
    const hasPhoto = !!media?.hasPhoto && !!media.imageSlug;
    const slug = media?.imageSlug ?? '';
    const base = `assets/${slug}`;
    /* Pull richer fields (material + description) from product-content
       — they're already authored per SKU and we use them on the
       flip-card back face. */
    const view = getProductView(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      size: p.size,
      priceLabel: formatINR(p.price),
      category: p.category,
      hasPhoto,
      avifSrcset: hasPhoto ? `${base}-400.avif 400w, ${base}-800.avif 800w` : '',
      webpSrcset: hasPhoto ? `${base}-400.webp 400w, ${base}-800.webp 800w` : '',
      jpgSrcset:  hasPhoto ? `${base}-400.jpg 400w, ${base}-800.jpg 800w` : '',
      fallback:   hasPhoto ? `${base}-400.jpg` : '',
      width:  media?.intrinsic?.w ?? 400,
      height: media?.intrinsic?.h ?? 400,
      alt: media?.alt ?? '',
      waUrl: whatsappOrderUrlForProduct(p.name, p.size),
      compostsInDays: COMPOST_DAYS[p.category] ?? 30,
      animalEdible: true,
      material: view?.content.material ?? 'Natural plant fiber',
      summary: firstSentence(
        view?.content.description,
        'Hand-pressed in our Neelambur workshop from agricultural by-products.',
      ),
    };
  }
}
