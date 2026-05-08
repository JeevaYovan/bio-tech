import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface SequenceFrame {
  /** Path to the source image (without the size/extension suffix). */
  readonly imageSlug: string;
  /** Title shown when this milestone is in view. */
  readonly title: string;
  /** Body copy shown beneath the title. */
  readonly description: string;
  /** Alt text for the image (used for the prerendered/no-JS view). */
  readonly alt: string;
}

/**
 * FarmMinerals-style pinned scroll sequence.
 *
 * Renders a canvas that cross-fades between N source photographs as the
 * user scrolls through a pinned section. Between any two source frames
 * we synthesise visual sub-frames by drawing photo `i` at decreasing
 * alpha + Ken-Burns scale on top of photo `i+1` at increasing alpha,
 * giving the impression of a continuous filmed sequence.
 *
 * 5 source photos × 16 sub-frames = 80 visual positions across the
 * scroll range. When more photography lands, just add entries to
 * `frames` — the synthesis logic is unchanged.
 *
 * Mobile fallback: the section degrades to a vertical stack of photo +
 * caption with cross-fade reveals. No pin, no canvas. Set via
 * `(min-width: 1024px)` media query in the SCSS.
 *
 * SSR-safe; `prefers-reduced-motion` keeps the static stack on desktop too.
 */
@Component({
  selector: 'app-scroll-sequence',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      #section
      class="seq"
      [class.is-mobile-fallback]="!canvasMode()"
      [attr.aria-labelledby]="titleId()">
      <!-- DESKTOP: pinned canvas + scroll-driven text milestones -->
      @if (canvasMode()) {
        <div class="seq__pin" #pin>
          <canvas #canvas class="seq__canvas" aria-hidden="true"></canvas>
          <div class="seq__overlay">
            <h2 [id]="titleId()" class="seq__main-title">{{ heading() }}</h2>
            <div class="seq__steps" #stepsBox>
              @for (frame of frames(); track frame.imageSlug; let i = $index) {
                <div
                  class="seq__step"
                  [attr.data-step]="i"
                  [class.is-active]="activeIndex() === i">
                  <span class="seq__step-num">{{ formatStep(i) }}</span>
                  <h3 class="seq__step-title">{{ frame.title }}</h3>
                  <p class="seq__step-body">{{ frame.description }}</p>
                </div>
              }
            </div>
          </div>
          <div class="seq__progress" aria-hidden="true">
            <div class="seq__progress-bar" #progress></div>
          </div>
        </div>
      }

      <!-- MOBILE / FALLBACK: vertical stack of photos + captions -->
      @if (!canvasMode()) {
        <div class="seq__fallback">
          <h2 [id]="titleId()" class="seq__main-title">{{ heading() }}</h2>
          @for (frame of frames(); track frame.imageSlug; let i = $index) {
            <div class="seq__fallback-item">
              <picture>
                <source
                  type="image/avif"
                  [attr.srcset]="'assets/' + frame.imageSlug + '-400.avif 400w, assets/' + frame.imageSlug + '-800.avif 800w'"
                  sizes="(min-width: 768px) 50vw, 100vw" />
                <source
                  type="image/webp"
                  [attr.srcset]="'assets/' + frame.imageSlug + '-400.webp 400w, assets/' + frame.imageSlug + '-800.webp 800w'"
                  sizes="(min-width: 768px) 50vw, 100vw" />
                <img
                  [src]="'assets/' + frame.imageSlug + '-400.jpg'"
                  [attr.srcset]="'assets/' + frame.imageSlug + '-400.jpg 400w, assets/' + frame.imageSlug + '-800.jpg 800w'"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  [attr.alt]="frame.alt"
                  width="400" height="300"
                  loading="lazy" decoding="async" />
              </picture>
              <div class="seq__fallback-text">
                <span class="seq__step-num">{{ formatStep(i) }}</span>
                <h3 class="seq__step-title">{{ frame.title }}</h3>
                <p class="seq__step-body">{{ frame.description }}</p>
              </div>
            </div>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './scroll-sequence.scss',
})
export class ScrollSequenceComponent implements AfterViewInit {
  readonly frames = input.required<readonly SequenceFrame[]>();
  readonly heading = input<string>('From harvest to table');
  readonly titleId = input<string>('seq-title');
  /** Pixel-distance the user must scroll to traverse the pinned section.
   *  Default: 300% of viewport height — gives the canvas enough range. */
  readonly scrollSpan = input<number>(3);

  /** Index of the currently visible (or nearest) source frame. */
  protected readonly activeIndex = signal(0);
  /** Whether to render the canvas pin mode (desktop) vs. the fallback stack. */
  protected readonly canvasMode = signal(false);

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly pin = viewChild<ElementRef<HTMLElement>>('pin');
  private readonly progress = viewChild<ElementRef<HTMLElement>>('progress');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected formatStep(i: number): string {
    return `${(i + 1).toString().padStart(2, '0')} / ${this.frames().length.toString().padStart(2, '0')}`;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia?.('(min-width: 1024px)').matches;
    if (reduce || !desktop) {
      this.canvasMode.set(false);
      return;
    }
    this.canvasMode.set(true);

    /* Need to defer slightly so the canvas element actually exists in
       the DOM (the @if (canvasMode()) branch only renders after we set
       canvasMode true). */
    queueMicrotask(() => this.bootCanvas());
  }

  private bootCanvas(): void {
    const canvasEl = this.canvas()?.nativeElement;
    const sectionEl = this.section().nativeElement;
    const progressEl = this.progress()?.nativeElement;
    if (!canvasEl) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const sizeCanvas = () => {
      const rect = canvasEl.getBoundingClientRect();
      canvasEl.width = rect.width * dpr;
      canvasEl.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    /* Preload all source photos using the 800w variant for crispness. */
    const sources = this.frames().map((f) => `assets/${f.imageSlug}-800.jpg`);
    const images = sources.map((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      return img;
    });

    const drawFrame = (progress: number) => {
      const rect = canvasEl.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const fcount = images.length;
      const idxFloat = progress * (fcount - 1);
      const idx = Math.floor(idxFloat);
      const frac = idxFloat - idx;

      const drawImageCover = (img: HTMLImageElement, alpha: number, scale: number) => {
        if (!img.complete || !img.naturalWidth) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        const ar = img.naturalWidth / img.naturalHeight;
        const cw = w * scale;
        const ch = w / ar * scale;
        let drawW = cw;
        let drawH = ch;
        if (drawH < h * scale) {
          drawH = h * scale;
          drawW = drawH * ar;
        }
        ctx.drawImage(img, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
        ctx.restore();
      };

      /* Synthesise the in-between frame: photo[idx] at decreasing alpha
         and increasing Ken-Burns scale, photo[idx+1] at increasing alpha
         and decreasing scale, layered. */
      const cur = images[idx];
      const next = images[Math.min(idx + 1, fcount - 1)];
      const curScale = 1.0 + frac * 0.08;
      const nextScale = 0.96 + frac * 0.04;
      drawImageCover(cur, 1 - frac, curScale);
      if (next !== cur) drawImageCover(next, frac, nextScale);

      this.activeIndex.set(idx);

      if (progressEl) {
        progressEl.style.transform = `scaleX(${progress})`;
      }
    };

    /* Pin the section and drive `progress` 0..1 across `scrollSpan` × vh. */
    const trigger = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top top',
      end: `+=${this.scrollSpan() * 100}%`,
      pin: true,
      pinSpacing: true,
      scrub: 1.5,
      onUpdate: (self) => drawFrame(self.progress),
    });

    /* Initial paint as soon as the largest image decodes. */
    Promise.all(images.map((img) => img.decode().catch(() => undefined))).then(
      () => drawFrame(0),
    );

    /* Debounced resize — ScrollTrigger.refresh() is expensive (forces
       layout reflow across every registered trigger). Without the
       150ms debounce, a single iOS URL-bar collapse or desktop
       window-edge drag fires resize 30+ times in a row, causing a
       cascade of layout thrashes on the main thread. */
    let resizeTimer = 0;
    const onResize = () => {
      sizeCanvas();
      drawFrame(trigger.progress);
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      trigger.kill();
    });
  }
}
