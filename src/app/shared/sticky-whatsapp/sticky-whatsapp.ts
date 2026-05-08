import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WA_URL } from '../constants';

/**
 * Sticky floating WhatsApp button — REBUILD §11a + animations #9 + #10.
 *
 * Hides on continuous scroll-down past 400 px; slides back in when scroll
 * direction reverses. Renders nothing during prerender (no platform
 * browser) so the static HTML stays clean and the button hydrates client-
 * side once scroll listeners can attach.
 *
 * The pulse (animation #9) is CSS-only and gated on
 * `prefers-reduced-motion: no-preference` in the SCSS file. We do not
 * gate it in TS — letting the OS preference cascade through CSS keeps
 * the component logic simple and matches the §7c spec.
 */
@Component({
  selector: 'app-sticky-whatsapp',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sticky-whatsapp.html',
  styleUrl: './sticky-whatsapp.scss',
})
export class StickyWhatsappComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private lastY = 0;

  protected readonly waUrl = WA_URL;
  /** false = hidden (off-screen below); true = visible. Initial: visible. */
  protected readonly visible = signal(true);
  /** Browser-only render gate. Static prerender skips the button entirely. */
  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (!this.isBrowser) return;
    this.lastY = window.scrollY;
  }

  /** Animation #10: hide on continuous scroll-down past 400 px;
      reveal when direction reverses. ALSO hide when the user is
      within 120 px of the bottom of the page — the button would
      otherwise overlay the footer's contact text + nav links
      (audit feedback). Coarse — no rAF — fine for a single host
      listener. */
  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const nearBottom = y > max - 120;
    if (nearBottom) {
      this.visible.set(false);
      this.lastY = y;
      return;
    }
    const goingDown = y > this.lastY;
    if (goingDown && y > 400) {
      this.visible.set(false);
    } else if (!goingDown) {
      this.visible.set(true);
    }
    this.lastY = y;
  }
}
