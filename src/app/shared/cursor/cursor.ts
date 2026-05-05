import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Decorative custom cursor — a small lime dot follows the pointer
 * exactly, plus a larger ring that lags slightly. Scales up over
 * interactive targets. Auto-disabled on touch / coarse-pointer devices
 * and under prefers-reduced-motion.
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
        [class.is-hover]="hovering()"
        [class.is-press]="pressed()"
        aria-hidden="true"></div>
      <div #dot class="cursor cursor--dot" aria-hidden="true"></div>
    }
  `,
  styleUrl: './cursor.scss',
})
export class CursorComponent implements AfterViewInit {
  protected readonly visible = signal(false);
  protected readonly hovering = signal(false);
  protected readonly pressed = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ring = viewChild<ElementRef<HTMLElement>>('ring');
  private readonly dot = viewChild<ElementRef<HTMLElement>>('dot');

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    /* Only render the custom cursor when the user has a fine pointer
       (mouse / trackpad) AND no reduced-motion preference. Touch and
       reduced-motion users keep the native system cursor. */
    const fine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    this.visible.set(true);

    /* Hide the native cursor while the custom one is active. */
    document.documentElement.classList.add('rt-custom-cursor');

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const dotEl = this.dot()?.nativeElement;
      if (dotEl) {
        dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'a, button, input, textarea, select, label, [role="button"], [role="tab"], [tabindex]:not([tabindex="-1"])',
      );
      this.hovering.set(!!interactive);
    };

    const onDown = () => this.pressed.set(true);
    const onUp = () => this.pressed.set(false);
    const onLeave = () => {
      mouseX = -100;
      mouseY = -100;
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      const ringEl = this.ring()?.nativeElement;
      if (ringEl) {
        ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

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
