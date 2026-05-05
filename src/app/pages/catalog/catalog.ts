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
import { displayableProducts, getMedia } from '../../../data/product-content';
import { SeoService } from '../../services/seo.service';
import { WA_URL, whatsappOrderUrlForProduct } from '../../shared/constants';
import { HorizontalSliderComponent } from '../../shared/horizontal-slider/horizontal-slider';
import { HorizontalSliderItemDirective } from '../../shared/horizontal-slider/horizontal-slider-item.directive';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

type Filter = 'all' | ProductCategory;

const titleCase = (s: string): string => s[0].toUpperCase() + s.slice(1);

interface CatalogItem {
  readonly slug: string;
  readonly name: string;
  readonly size: string;
  readonly priceLabel: string;
  readonly category: ProductCategory;
  readonly hasPhoto: boolean;
  readonly avifSrcset: string;
  readonly webpSrcset: string;
  readonly jpgSrcset: string;
  readonly fallback: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly waUrl: string;
}

interface FilterTab {
  readonly value: Filter;
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, HorizontalSliderComponent, HorizontalSliderItemDirective, SectionBadgeComponent, RevealOnScrollDirective],
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

  private toItem(p: { slug: string; name: string; size: string; price: number; category: ProductCategory }): CatalogItem {
    const media = getMedia(p.slug);
    const hasPhoto = !!media?.hasPhoto && !!media.imageSlug;
    const slug = media?.imageSlug ?? '';
    const base = `assets/${slug}`;
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
    };
  }
}
