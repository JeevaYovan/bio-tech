import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Multi-layer nature parallax hero.
 *
 * Layers (back to front):
 *   1. Background: animated radial-gradient + leaf-pattern SVG
 *   2. Mid: drifting blob shapes (CSS @keyframes, animation-driven)
 *   3. Content: badge + title + lede + CTAs (projected via <ng-content>)
 *   4. Foreground: floating particle dots (CSS-only, GPU transform)
 *
 * Parallax is scroll-driven: a single rAF on scroll updates --rt-scroll
 * (a number from 0..1 mapped over the hero's intersect range), and CSS
 * uses that custom property to translateY each layer at a different
 * speed.
 *
 * Honours `prefers-reduced-motion`: drift + particle keyframes pause,
 * scroll listener doesn't even attach.
 */
@Component({
  selector: 'app-nature-parallax-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section #host class="np" [attr.aria-labelledby]="titleId()">
      <!-- Layer 1: animated gradient + leaf texture -->
      <div class="np__bg" aria-hidden="true">
        <div class="np__bg-gradient"></div>
        <div class="np__bg-leaves"></div>
      </div>

      <!-- Layer 2: drifting blob shapes -->
      <div class="np__mid" aria-hidden="true">
        <span class="np__blob np__blob--a"></span>
        <span class="np__blob np__blob--b"></span>
        <span class="np__blob np__blob--c"></span>
      </div>

      <!-- Layer 3: content (projected) -->
      <div class="np__inner">
        <div class="np__copy hero-stagger">
          <ng-content></ng-content>
        </div>
      </div>

      <!-- Layer 4: foreground particles (CSS-only) -->
      <div class="np__particles" aria-hidden="true">
        @for (n of particles; track n) {
          <span class="np__particle" [style.--n]="n"></span>
        }
      </div>
    </section>
  `,
  styleUrl: './nature-parallax-hero.scss',
})
export class NatureParallaxHeroComponent implements AfterViewInit {
  /** ARIA: id of the heading inside the projected content. */
  readonly titleId = input<string>('hero-title');

  protected readonly particles = Array.from({ length: 18 }, (_, i) => i);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const el = this.host().nativeElement;
    let raf = 0;
    let pending = false;

    const update = () => {
      pending = false;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));
      el.style.setProperty('--rt-scroll', progress.toString());
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    });
  }
}
