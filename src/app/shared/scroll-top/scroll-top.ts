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
 * Smart scroll button — single floating action that flips its mode
 * based on where the user is on the page.
 *
 *   • At the top of the page (scrollY < 80) → arrow points DOWN.
 *     Click jumps to the bottom of the page (footer).
 *   • Scrolled past 80 px → arrow points UP. Click jumps back to top.
 *
 * Only renders if the page is actually long enough to scroll — short
 * pages don't need it.  Bottom-left so it doesn't fight the bottom-
 * right WhatsApp CTA. SSR-safe (no DOM access during prerender).
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
  /** True when the user is near the top — button shows DOWN arrow. */
  protected readonly atTop = signal(true);
  /** True when the page is long enough to need either jump. */
  protected readonly hasScrollableContent = signal(false);

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    if (!this.isBrowser) return;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.atTop.set(y < 80);
    /* Hide the button if the page barely scrolls — e.g. a 404 page or
       a privacy notice. Threshold is 200 px of headroom. */
    this.hasScrollableContent.set(max > 200);
  }

  protected onClick(): void {
    if (!this.isBrowser) return;
    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';
    if (this.atTop()) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior,
      });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }
}
