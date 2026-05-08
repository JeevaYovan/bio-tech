import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticDirective } from '../magnetic/magnetic.directive';

gsap.registerPlugin(ScrollTrigger);

export interface ProductShowcaseImage {
  readonly avifSrcset: string;
  readonly webpSrcset: string;
  readonly jpgSrcset: string;
  readonly fallback: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
}

export interface ProductShowcaseData {
  readonly name: string;
  readonly size: string;
  readonly priceLabel: string;
  readonly waUrl: string;
  readonly image: ProductShowcaseImage | null;
  readonly compostsInDays: number;
  readonly animalEdible: boolean;
  readonly chemicalFree: boolean;
  readonly material: string;
}

/**
 * Sticky scroll-driven product showcase.
 *
 * Layout: image pinned at `top: 20vh` while the surrounding narrative
 * scrolls past. As the user scrolls through the section, the image
 * rotates around its Y-axis from -15° to +15° (smaller on mobile),
 * three feature badges fade in at scroll milestones, and the price
 * tag scales from 2× down to 1× as it approaches the CTA.
 *
 * The "Order on WhatsApp" button is `[appMagnetic]` and pulses subtly
 * once it's fully in view.
 *
 * Reduced-motion: image static, badges all visible at start, no
 * rotation, no price scale, no magnetic pull.
 */
@Component({
  selector: 'app-product-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective],
  template: `
    <div class="ps" #host>
      <!-- LEFT: pinned image with scroll-driven 3D rotation -->
      <div class="ps__sticky">
        <div class="ps__visual" #visual>
          @if (data().image; as img) {
            <picture class="ps__image">
              <source type="image/avif" [attr.srcset]="img.avifSrcset" sizes="(min-width: 1024px) 50vw, 100vw" />
              <source type="image/webp" [attr.srcset]="img.webpSrcset" sizes="(min-width: 1024px) 50vw, 100vw" />
              <img
                [src]="img.fallback"
                [attr.srcset]="img.jpgSrcset"
                sizes="(min-width: 1024px) 50vw, 100vw"
                [attr.width]="img.width"
                [attr.height]="img.height"
                loading="eager"
                fetchpriority="high"
                decoding="sync"
                [attr.alt]="img.alt" />
            </picture>
          } @else {
            <div class="ps__placeholder" aria-hidden="true">
              <p class="ps__ph-eyebrow">Studio photo coming soon</p>
              <p class="ps__ph-name">{{ data().name }}</p>
              <p class="ps__ph-size">{{ data().size }}</p>
            </div>
          }

          <!-- Feature beat badges -->
          <ul class="ps__beats" role="list" #beats>
            <li class="ps__beat" data-beat="0">
              <span class="ps__beat-icon" aria-hidden="true">⚭</span>
              <span class="ps__beat-text">100% Biodegradable</span>
            </li>
            @if (data().chemicalFree) {
              <li class="ps__beat" data-beat="1">
                <span class="ps__beat-icon" aria-hidden="true">⌬</span>
                <span class="ps__beat-text">Chemical-free, food-safe</span>
              </li>
            }
            <li class="ps__beat ps__beat--final" data-beat="2">
              <span class="ps__beat-icon" aria-hidden="true">⌛</span>
              <span class="ps__beat-text">Composts in {{ data().compostsInDays }} days</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- RIGHT: scrollable narrative (projected via ng-content) -->
      <div class="ps__narrative" #narrative>
        <ng-content></ng-content>

        <!-- Mega price + magnetic CTA at the end of the narrative -->
        <div class="ps__price-block" #priceBlock>
          <p class="ps__price-label">From</p>
          <p class="ps__price" #priceEl>
            {{ data().priceLabel }}
            <span class="ps__price-per">per piece</span>
          </p>
          <a
            [href]="data().waUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn--accent btn--large ps__cta"
            appMagnetic
            [magneticRadius]="160"
            [magneticStrength]="0.45"
            [class.is-pulsing]="ctaPulsing()">
            <span>Order on WhatsApp</span>
            <span class="btn__arrow" aria-hidden="true">→</span>
            <span class="visually-hidden"> (opens in new tab)</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styleUrl: './product-showcase.scss',
})
export class ProductShowcaseComponent implements AfterViewInit {
  readonly data = input.required<ProductShowcaseData>();

  protected readonly ctaPulsing = signal(false);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly visual = viewChild.required<ElementRef<HTMLElement>>('visual');
  private readonly priceEl = viewChild<ElementRef<HTMLElement>>('priceEl');
  private readonly priceBlock = viewChild<ElementRef<HTMLElement>>('priceBlock');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      /* All beats visible immediately, no rotation. */
      const beatEls = this.host().nativeElement.querySelectorAll<HTMLElement>('.ps__beat');
      beatEls.forEach((el: HTMLElement) => (el.style.opacity = '1'));
      return;
    }

    const desktop = window.matchMedia?.('(min-width: 1024px)').matches;
    const maxRotate = desktop ? 15 : 8;

    const hostEl = this.host().nativeElement;
    const visualEl = this.visual().nativeElement;
    const beatEls = hostEl.querySelectorAll<HTMLElement>('.ps__beat');
    const priceEl = this.priceEl()?.nativeElement;
    const priceBlockEl = this.priceBlock()?.nativeElement;

    /* 3D rotation perspective — applied to the parent of the image
       so the rotation reads correctly. */
    visualEl.style.perspective = '1200px';

    /* Initial state: beats hidden, price 2x. */
    gsap.set(beatEls, { opacity: 0, y: 20 });
    if (priceEl) gsap.set(priceEl, { scale: 2, transformOrigin: 'left center' });

    /* Master timeline scrubbed against the host's viewport progress. */
    const trigger = ScrollTrigger.create({
      trigger: hostEl,
      start: 'top top+=80',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress; /* 0..1 across the section */

        /* Image rotation: -maxRotate at progress 0, +maxRotate at 1. */
        const rotY = (p - 0.5) * 2 * maxRotate;
        gsap.set(visualEl, { rotateY: rotY, transformPerspective: 1200 });

        /* Beats fade in at 0.25, 0.50, 0.75 milestones with a small
           translateY rise. gsap.set() batches into the next render
           tick so we avoid forcing a synchronous style recalc on
           every scroll event (the previous direct el.style writes
           were measured by the perf agent as a hot path). */
        beatEls.forEach((el: HTMLElement, i: number) => {
          const milestone = 0.25 * (i + 1);
          const win = 0.15;
          const local = Math.max(0, Math.min(1, (p - (milestone - win)) / win));
          gsap.set(el, { opacity: local, y: (1 - local) * 20 });
        });

        /* Price: scales from 2 down to 1 as user moves from 0.7 to 0.95. */
        if (priceEl) {
          const priceLocal = Math.max(0, Math.min(1, (p - 0.7) / 0.25));
          const priceScale = 2 - priceLocal;
          gsap.set(priceEl, { scale: priceScale, transformOrigin: 'left center' });
        }
      },
    });

    /* CTA pulses once the price block is in view. */
    let pulseTrigger: ScrollTrigger | null = null;
    if (priceBlockEl) {
      pulseTrigger = ScrollTrigger.create({
        trigger: priceBlockEl,
        start: 'top 70%',
        end: 'bottom top',
        onEnter: () => this.ctaPulsing.set(true),
        onLeaveBack: () => this.ctaPulsing.set(false),
      });
    }

    this.destroyRef.onDestroy(() => {
      trigger.kill();
      pulseTrigger?.kill();
    });
  }
}
