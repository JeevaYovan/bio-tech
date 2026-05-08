import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Scroll-to-top button — single floating action that appears once
 * the user has scrolled meaningfully into the page, and jumps back
 * to the top on click. Standard pattern; previously this component
 * also offered a "scroll to bottom" mode at the top of the page,
 * which was non-standard UX (audit feedback) and confused users
 * who expected only the conventional behaviour.
 *
 * Hidden when:
 *   - The page barely scrolls (< 200px of headroom — short routes
 *     like /privacy don't need the button).
 *   - The user is within 80px of the top (no point scrolling up
 *     when you're already there).
 *   - The user is within 100px of the bottom — at that point the
 *     bottom-right sticky WhatsApp button is also visible and the
 *     two would crowd each other in the same thumb zone.
 *
 * Bottom-left position keeps it out of the way of the bottom-right
 * WhatsApp CTA. SSR-safe.
 */
@Component({
  selector: 'app-scroll-top',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-top.html',
  styleUrl: './scroll-top.scss',
})
export class ScrollTopComponent {
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  /** True when the page is long enough AND the user is past 80px
   *  AND not already near the bottom. */
  protected readonly visible = signal(false);

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    if (!this.isBrowser) return;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const longEnough = max > 200;
    const pastTop = y > 80;
    const nearBottom = y > max - 100;
    this.visible.set(longEnough && pastTop && !nearBottom);
  }

  protected onClick(): void {
    if (!this.isBrowser) return;
    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
}
