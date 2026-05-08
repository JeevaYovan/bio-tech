import {
  AfterViewInit,
  Directive,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

/* ----------------------------------------------------------------
 * Shared mousemove dispatcher.
 *
 * Pre-consolidation, every `[appMagnetic]` instance attached its own
 * `window.mousemove` listener. With 5+ magnetic CTAs across home
 * (nav order button, hero CTAs, footer CTAs, feature cards), that's
 * 5+ window-level handlers all firing on every pointer event, each
 * one calling `getBoundingClientRect()` (forced layout) inline.
 *
 * Now: one window handler fans out via a Set of registered hooks.
 * Each hook reads its own host's bounding rect once and decides
 * whether to engage. The total layout-read cost is the same, but
 * we avoid the per-listener event-dispatch overhead and keep the
 * registry sortable / suspendable in one place.
 * ---------------------------------------------------------------- */
type MagneticHook = (e: MouseEvent) => void;
const hooks = new Set<MagneticHook>();
let dispatcherAttached = false;

function dispatch(e: MouseEvent): void {
  hooks.forEach((h) => h(e));
}

function ensureDispatcher(): void {
  if (dispatcherAttached) return;
  dispatcherAttached = true;
  window.addEventListener('mousemove', dispatch, { passive: true });
}

function registerHook(hook: MagneticHook): () => void {
  hooks.add(hook);
  ensureDispatcher();
  return () => {
    hooks.delete(hook);
    /* Detach the dispatcher when no hooks remain. Re-attaches on the
       next register. */
    if (hooks.size === 0 && dispatcherAttached) {
      dispatcherAttached = false;
      window.removeEventListener('mousemove', dispatch);
    }
  };
}

/**
 * Magnetic hover effect — the host element follows the cursor with a
 * spring-easing pull while the cursor is within `magneticRadius` px,
 * and snaps back to its origin when the cursor leaves.
 *
 * Apply to primary CTAs:  `<a class="btn btn--accent" appMagnetic>...</a>`
 *
 * Disabled on coarse-pointer (touch) devices and under
 * prefers-reduced-motion.
 */
@Directive({
  selector: '[appMagnetic]',
  standalone: true,
})
export class MagneticDirective implements AfterViewInit {
  /** Radius in px around the host within which the magnetic pull engages. */
  @Input() magneticRadius = 120;
  /** How strongly the host follows the cursor (0..1). 0.3 = gentle, 0.6 = strong. */
  @Input() magneticStrength = 0.4;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const host = this.el.nativeElement;

    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > this.magneticRadius) {
        gsap.to(host, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
        return;
      }
      gsap.to(host, {
        x: dx * this.magneticStrength,
        y: dy * this.magneticStrength,
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const onLeave = () => {
      gsap.to(host, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    /* Register with the shared dispatcher — one window listener, N
       registered hooks. */
    const unregister = registerHook(onMove);
    host.addEventListener('mouseleave', onLeave);

    this.destroyRef.onDestroy(() => {
      unregister();
      host.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(host);
    });
  }
}
