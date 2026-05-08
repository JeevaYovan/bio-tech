import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

type CursorState = 'default' | 'link' | 'image' | 'cta';

/**
 * Decorative custom cursor — extended dual-ring + trail system.
 *
 * Layers (back to front):
 *   1. Outer ring  — lerps toward cursor (factor 0.18); scales / colour-
 *      shifts based on the hovered element's `data-cursor` attribute.
 *   2. Three trail dots — lerp at 0.10 / 0.07 / 0.05; fading opacity.
 *   3. Core dot — follows the cursor exactly.
 *
 * Per-element states (set by `data-cursor` on any interactive ancestor):
 *   - `default` — base lime ring, 36px
 *   - `link`    — ring scales 1.6× on hover targets
 *   - `image`   — 1.8× over product imagery
 *   - `cta`     — 2.0× + colour shifts to --rathika-gold
 *
 * Optional `data-cursor-blend="difference"` on dark sections toggles
 * mix-blend-mode: difference for high contrast over either bg.
 *
 * Disabled on coarse pointers and reduced-motion (native cursor stays).
 */
@Component({
  selector: 'app-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        #ring
        class="cursor cursor--ring"
        [class.is-press]="pressed()"
        [class.is-link]="state() === 'link'"
        [class.is-image]="state() === 'image'"
        [class.is-cta]="state() === 'cta'"
        [class.is-blend]="blendDifference()"
        aria-hidden="true">
        @if (state() === 'image') { <span class="cursor__label">VIEW</span> }
      </div>
      <div #trail1 class="cursor cursor--trail cursor--trail-1" aria-hidden="true"></div>
      <div #trail2 class="cursor cursor--trail cursor--trail-2" aria-hidden="true"></div>
      <div #trail3 class="cursor cursor--trail cursor--trail-3" aria-hidden="true"></div>
      <div
        #dot
        class="cursor cursor--dot"
        [class.is-cta]="state() === 'cta'"
        [class.is-blend]="blendDifference()"
        aria-hidden="true"></div>
    }
  `,
  styleUrl: './cursor.scss',
})
export class CursorComponent implements AfterViewInit {
  protected readonly visible = signal(false);
  protected readonly pressed = signal(false);
  protected readonly state = signal<CursorState>('default');
  protected readonly blendDifference = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ring = viewChild<ElementRef<HTMLElement>>('ring');
  private readonly dot = viewChild<ElementRef<HTMLElement>>('dot');
  private readonly trail1 = viewChild<ElementRef<HTMLElement>>('trail1');
  private readonly trail2 = viewChild<ElementRef<HTMLElement>>('trail2');
  private readonly trail3 = viewChild<ElementRef<HTMLElement>>('trail3');

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    this.visible.set(true);
    document.documentElement.classList.add('rt-custom-cursor');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let t1x = -100, t1y = -100;
    let t2x = -100, t2y = -100;
    let t3x = -100, t3y = -100;
    let raf = 0;
    /* Whether the rAF tick is currently scheduled. We suspend the loop
       when ring + trail dots have all settled within 0.5px of the
       cursor; the next mousemove restarts it. Without this, the rAF
       runs forever even with the cursor still — burning a frame every
       16ms doing nothing. */
    let active = false;

    const setTransform = (
      el: HTMLElement | undefined,
      x: number,
      y: number,
    ) => {
      if (!el) return;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    /* Cache last target — DOM walks (closest()) only fire when the
       cursor crosses element boundaries, not every mousemove tick.
       Without this, three closest() calls × 60fps × multiple ancestor
       traversals show up in the perf flamegraph. */
    let lastTarget: EventTarget | null = null;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setTransform(this.dot()?.nativeElement, mouseX, mouseY);
      /* Wake the rAF tick if it was suspended. */
      if (!active) {
        active = true;
        raf = requestAnimationFrame(tick);
      }

      if (e.target === lastTarget) return;
      lastTarget = e.target;

      /* Resolve cursor state from the closest ancestor carrying a
         data-cursor attribute. Falls back to 'link' when the target
         is interactive but not explicitly tagged. */
      const target = e.target as HTMLElement | null;
      const tagged = target?.closest<HTMLElement>('[data-cursor]');
      const interactive = target?.closest(
        'a, button, input, textarea, select, label, [role="button"], [role="tab"], [tabindex]:not([tabindex="-1"])',
      );
      const cursorAttr = tagged?.dataset['cursor'] as CursorState | undefined;
      const next: CursorState =
        cursorAttr ?? (interactive ? 'link' : 'default');
      if (this.state() !== next) this.state.set(next);

      /* Mix-blend-mode toggle: any ancestor with
         data-cursor-blend="difference" turns it on. */
      const blend = !!target?.closest<HTMLElement>(
        '[data-cursor-blend="difference"]',
      );
      if (this.blendDifference() !== blend) this.blendDifference.set(blend);
    };

    const onDown = () => this.pressed.set(true);
    const onUp = () => this.pressed.set(false);
    const onLeave = () => {
      mouseX = -100;
      mouseY = -100;
    };

    const tick = () => {
      /* Outer ring lerps fastest; trail dots progressively slower so
         they drag behind. Different lerp factors per dot create the
         3-dot ghost trail. */
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      t1x += (mouseX - t1x) * 0.10;
      t1y += (mouseY - t1y) * 0.10;
      t2x += (mouseX - t2x) * 0.07;
      t2y += (mouseY - t2y) * 0.07;
      t3x += (mouseX - t3x) * 0.05;
      t3y += (mouseY - t3y) * 0.05;

      setTransform(this.ring()?.nativeElement, ringX, ringY);
      setTransform(this.trail1()?.nativeElement, t1x, t1y);
      setTransform(this.trail2()?.nativeElement, t2x, t2y);
      setTransform(this.trail3()?.nativeElement, t3x, t3y);

      /* Suspend the loop when everything has caught up to the cursor.
         The slowest dot (t3, lerp 0.05) governs settle time. */
      const settled =
        Math.abs(mouseX - t3x) < 0.5 && Math.abs(mouseY - t3y) < 0.5 &&
        Math.abs(mouseX - ringX) < 0.5 && Math.abs(mouseY - ringY) < 0.5;
      if (settled) {
        active = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    active = true;
    raf = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('mouseleave', onLeave, { passive: true });

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onLeave);
      document.documentElement.classList.remove('rt-custom-cursor');
    });
  }
}
