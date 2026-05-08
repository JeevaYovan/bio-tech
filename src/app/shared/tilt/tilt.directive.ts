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

/**
 * 3D mouse-tilt — rotates the host element around X/Y based on where
 * the cursor sits within its bounds. Adds a subtle parallax-on-the-spot
 * feel; works well on cards.
 *
 * Apply with: `<div class="card" appTilt>...</div>`
 *
 * Disabled on coarse-pointer / reduced-motion. Sets `transform-style:
 * preserve-3d` and a perspective on the parent for the rotation to
 * read correctly.
 */
/**
 * Note: `will-change: transform` is intentionally NOT set in the host
 * metadata — that would promote every tilt-decorated card to its own
 * compositor layer permanently, even before any hover happens (and on
 * touch devices where the listener never attaches). With 12+ cards on
 * home, that's wasted GPU memory. Instead we toggle it on `mouseenter`
 * and clear it after the leave-tween settles.
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
  host: { style: 'transform-style: preserve-3d;' },
})
export class TiltDirective implements AfterViewInit {
  /** Maximum rotation in degrees around X and Y axes. */
  @Input() tiltMax = 8;
  /** Optional inner glare layer scale — applied as a subtle gradient
   *  shift in CSS by reading --tilt-x and --tilt-y custom properties. */
  @Input() tiltScale = 1.02;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    const host = this.el.nativeElement;
    const parent = host.parentElement;
    if (parent) parent.style.perspective = '1000px';

    const onEnter = () => {
      host.style.willChange = 'transform';
    };

    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   /* 0..1 */
      const y = (e.clientY - rect.top) / rect.height;   /* 0..1 */
      const rotY = (x - 0.5) * this.tiltMax * 2;        /* -tiltMax..+tiltMax */
      const rotX = (0.5 - y) * this.tiltMax * 2;
      gsap.to(host, {
        rotateX: rotX,
        rotateY: rotY,
        scale: this.tiltScale,
        duration: 0.4,
        ease: 'power3.out',
        transformPerspective: 1000,
      });
      host.style.setProperty('--tilt-x', x.toString());
      host.style.setProperty('--tilt-y', y.toString());
    };

    const onLeave = () => {
      gsap.to(host, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => {
          /* Drop the compositor layer once the tween settles. */
          host.style.willChange = 'auto';
        },
      });
    };

    host.addEventListener('mouseenter', onEnter);
    host.addEventListener('mousemove', onMove);
    host.addEventListener('mouseleave', onLeave);

    this.destroyRef.onDestroy(() => {
      host.removeEventListener('mouseenter', onEnter);
      host.removeEventListener('mousemove', onMove);
      host.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf(host);
    });
  }
}
