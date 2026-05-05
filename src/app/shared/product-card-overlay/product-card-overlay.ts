import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface ProductCardOverlayData {
  readonly slug: string;
  readonly name: string;
  readonly size: string;
  readonly priceLabel: string;
  readonly category: string;
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

@Component({
  selector: 'app-product-card-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article class="card">
      <a class="card__media-link" [routerLink]="['/products', p().slug]" [attr.aria-label]="p().name">
        @if (p().hasPhoto) {
          <picture class="card__media">
            <source type="image/avif" [attr.srcset]="p().avifSrcset" [attr.sizes]="sizes()" />
            <source type="image/webp" [attr.srcset]="p().webpSrcset" [attr.sizes]="sizes()" />
            <img
              [src]="p().fallback"
              [attr.srcset]="p().jpgSrcset"
              [attr.sizes]="sizes()"
              [attr.width]="p().width"
              [attr.height]="p().height"
              loading="lazy"
              decoding="async"
              [attr.alt]="p().alt" />
          </picture>
        } @else {
          <div class="card__placeholder" aria-hidden="true">
            <span>{{ p().name }}</span>
          </div>
        }
        <span class="card__chip">{{ p().category }}</span>
      </a>

      <div class="card__body">
        <a class="card__name" [routerLink]="['/products', p().slug]">
          {{ p().name }}
        </a>
        <p class="card__size">{{ p().size }}</p>
        <p class="card__price">
          <span class="card__price-num">{{ p().priceLabel }}</span>
          <span class="card__price-per">per piece</span>
        </p>
      </div>

      <a
        class="card__cta"
        [href]="p().waUrl"
        target="_blank"
        rel="noopener noreferrer"
        [attr.aria-label]="'Order ' + p().name + ' on WhatsApp (opens in new tab)'">
        <span>Order on WhatsApp</span>
        <span class="card__cta-arrow" aria-hidden="true">→</span>
      </a>
    </article>
  `,
  styleUrl: './product-card-overlay.scss',
})
export class ProductCardOverlayComponent {
  readonly p = input.required<ProductCardOverlayData>();
  readonly sizes = input<string>(
    '(min-width: 1024px) 320px, (min-width: 640px) 33vw, 50vw',
  );
}
