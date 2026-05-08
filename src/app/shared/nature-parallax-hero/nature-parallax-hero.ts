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

    /* Mouse parallax — items in the backdrop shift slightly
       toward the cursor with smooth lerp, so the layer feels
       interactive (the "click moving" effect the user asked
       for). Two CSS custom properties drive the .np__bg-leaves
       transform: --rt-mx and --rt-my, range -1..+1. The CSS
       layer reads these alongside its own keyframe drift. */
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    let mxTarget = 0, myTarget = 0;
    let mx = 0, my = 0;
    let mouseRaf = 0;
    let active = false;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mxTarget = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      myTarget = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!active) {
        active = true;
        mouseRaf = requestAnimationFrame(tickMouse);
      }
    };

    const tickMouse = () => {
      const nx = mx + (mxTarget - mx) * 0.08;
      const ny = my + (myTarget - my) * 0.08;
      mx = nx;
      my = ny;
      el.style.setProperty('--rt-mx', mx.toFixed(3));
      el.style.setProperty('--rt-my', my.toFixed(3));
      if (Math.abs(mxTarget - mx) < 0.002 && Math.abs(myTarget - my) < 0.002) {
        active = false;
        return;
      }
      mouseRaf = requestAnimationFrame(tickMouse);
    };

    const onLeave = () => { mxTarget = 0; myTarget = 0; if (!active) { active = true; mouseRaf = requestAnimationFrame(tickMouse); } };

    if (fine) {
      el.addEventListener('mousemove', onMove, { passive: true });
      el.addEventListener('mouseleave', onLeave);
    }

    /* Click pulse — clicking anywhere on the hero adds the
       .is-clicked class to the host for 900ms, which triggers
       the np-blueprint-pulse keyframe in SCSS. Lets the user
       "tap" the surface and see it react. Works on touch too
       (touchstart-derived click). */
    let clickTimer = 0;
    const onClick = () => {
      el.classList.add('is-clicked');
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => {
        el.classList.remove('is-clicked');
      }, 900);
    };
    el.addEventListener('click', onClick);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(mouseRaf);
      window.clearTimeout(clickTimer);
      el.removeEventListener('click', onClick);
      if (fine) {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      }
    });
  }
}
