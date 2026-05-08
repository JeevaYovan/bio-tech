import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface FlipCardData {
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
  /** Days to compost cleanly outdoors. */
  readonly compostsInDays: number;
  /** Whether discarded pieces are safe for animals to consume. */
  readonly animalEdible: boolean;
  /** Material summary used on the back. */
  readonly material: string;
  /** Short description used on the back. */
  readonly summary: string;
}

/**
 * 3D flip product card. Front shows image / name / price. Back reveals
 * description, material, compost time + animal-edible badges, and a
 * "Order on WhatsApp" mini-CTA.
 *
 * Behaviour:
 * - Hover (devices with `(hover: hover) and (pointer: fine)`) flips the
 *   card automatically.
 * - Touch / coarse pointer: front shows a "Details" toggle that flips
 *   the card explicitly. Tap-outside or tap the close arrow returns.
 * - prefers-reduced-motion: degrades to a no-flip stacked layout so the
 *   back content is shown directly under the front.
 */
@Component({
  selector: 'app-product-flip-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <article
      class="flip"
      [class.is-flipped]="flipped()"
      [class.is-static]="reducedMotion">
      <div class="flip__inner">
        <!-- ===== FRONT ===== -->
        <!-- inert when flipped — keeps the rotated-away face out of the
             tab order and the AT tree (a11y SC 2.1.1 / 2.4.3). -->
        <div class="flip__face flip__face--front" [attr.inert]="flipped() ? '' : null">
          <a class="flip__media-link" [routerLink]="['/products', p().slug]" [attr.aria-label]="p().name">
            @if (p().hasPhoto) {
              <picture class="flip__media">
                <source type="image/avif" [attr.srcset]="p().avifSrcset" sizes="(min-width: 1024px) 320px, 50vw" />
                <source type="image/webp" [attr.srcset]="p().webpSrcset" sizes="(min-width: 1024px) 320px, 50vw" />
                <img
                  [src]="p().fallback"
                  [attr.srcset]="p().jpgSrcset"
                  sizes="(min-width: 1024px) 320px, 50vw"
                  [attr.width]="p().width"
                  [attr.height]="p().height"
                  loading="lazy"
                  decoding="async"
                  [attr.alt]="p().alt" />
              </picture>
            } @else {
              <div class="flip__placeholder" aria-hidden="true">
                <span>{{ p().name }}</span>
              </div>
            }
            <span class="flip__chip">{{ p().category }}</span>
          </a>
          <div class="flip__body">
            <a class="flip__name" [routerLink]="['/products', p().slug]">{{ p().name }}</a>
            <p class="flip__size">{{ p().size }}</p>
            <p class="flip__price">
              <span class="flip__price-num">{{ p().priceLabel }}</span>
              <span class="flip__price-per">per piece</span>
            </p>
          </div>
          <button
            type="button"
            class="flip__details"
            aria-label="Show product details"
            (click)="toggleFlip($event)">
            <span>Details</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <!-- ===== BACK =====
             inert when NOT flipped — same rationale: prevents focus
             leaking onto the rotated-away face. aria-hidden is also
             kept for legacy AT support. -->
        <div class="flip__face flip__face--back"
             [attr.aria-hidden]="!flipped()"
             [attr.inert]="!flipped() ? '' : null">
          <button
            type="button"
            class="flip__close"
            aria-label="Back to product image"
            (click)="toggleFlip($event)">
            <span aria-hidden="true">←</span>
          </button>
          <h3 class="flip__back-name">{{ p().name }}</h3>
          <p class="flip__back-size">{{ p().size }}</p>
          <p class="flip__summary">{{ p().summary }}</p>
          <dl class="flip__specs">
            <dt>Material</dt>
            <dd>{{ p().material }}</dd>
            <dt>Composts</dt>
            <dd>{{ p().compostsInDays }} days outdoors</dd>
          </dl>
          <ul class="flip__badges" role="list">
            <li class="flip__badge flip__badge--compost">
              <span aria-hidden="true">⌛</span>
              Composts in {{ p().compostsInDays }} days
            </li>
            @if (p().animalEdible) {
              <li class="flip__badge flip__badge--animal">
                <span aria-hidden="true">✿</span>
                Animal-safe
              </li>
            }
            <li class="flip__badge flip__badge--clean">
              <span aria-hidden="true">⚭</span>
              No chemicals
            </li>
          </ul>
          <a
            class="flip__cta"
            [href]="p().waUrl"
            target="_blank"
            rel="noopener noreferrer"
            [attr.aria-label]="'Order ' + p().name + ' on WhatsApp (opens in new tab)'">
            <span>Order on WhatsApp</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  `,
  styleUrl: './product-flip-card.scss',
})
export class ProductFlipCardComponent {
  readonly p = input.required<FlipCardData>();
  protected readonly flipped = signal(false);
  protected readonly reducedMotion: boolean;

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    this.reducedMotion = isPlatformBrowser(this.platformId)
      ? !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      : true; /* On the server, treat as reduced — flat layout for SSR HTML. */
  }

  protected toggleFlip(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.flipped.update((v) => !v);
  }
}
