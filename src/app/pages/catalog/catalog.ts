import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  formatINR,
  productCategories,
  products,
  type ProductCategory,
} from '../../../data/products';
import { getMedia } from '../../../data/product-content';
import { SeoService } from '../../services/seo.service';

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
}

interface FilterTab {
  readonly value: Filter;
  readonly label: string;
  readonly count: number;
}

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export default class CatalogComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly filter = signal<Filter>('all');

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Full catalog of Rathika Biotech biodegradable tableware: 14 plates, bowls, cups, spoons, parcel boxes, and decorative statues. INR pricing. Bulk orders on WhatsApp.',
      canonicalPath: '/products/',
      ogTitle: 'Eco-Friendly Plates, Cups & Bowls | Rathika Biotech Coimbatore',
    });
  }

  protected readonly filterTabs: ReadonlyArray<FilterTab> = (() => {
    const all: FilterTab = { value: 'all', label: 'All', count: products.length };
    const byCat = productCategories.map<FilterTab>((c) => ({
      value: c,
      label: titleCase(c),
      count: products.filter((p) => p.category === c).length,
    }));
    return [all, ...byCat];
  })();

  protected readonly visibleProducts = computed<ReadonlyArray<CatalogItem>>(() => {
    const f = this.filter();
    const filtered = f === 'all' ? products : products.filter((p) => p.category === f);
    return filtered.map<CatalogItem>((p) => {
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
      };
    });
  });

  protected setFilter(value: Filter): void {
    this.filter.set(value);
  }
}
