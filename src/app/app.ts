import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  OnInit,
  AfterViewInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ChildrenOutletContexts,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from './services/seo.service';
import { WA_URL } from './shared/constants';
import { StickyWhatsappComponent } from './shared/sticky-whatsapp/sticky-whatsapp';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top';
import { PageLoaderComponent } from './shared/page-loader/page-loader';
import { CursorComponent } from './shared/cursor/cursor';
import { LenisScrollService } from './shared/lenis-scroll/lenis-scroll.service';
import { MagneticDirective } from './shared/magnetic/magnetic.directive';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    StickyWhatsappComponent,
    ScrollTopComponent,
    PageLoaderComponent,
    CursorComponent,
    MagneticDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('routeFade', [
      transition('* <=> *', [
        style({ opacity: 0 }),
        animate('200ms cubic-bezier(0.2, 0, 0, 1)', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class App implements OnInit, AfterViewInit {
  private readonly seo = inject(SeoService);
  private readonly contexts = inject(ChildrenOutletContexts);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly lenis = inject(LenisScrollService);

  protected readonly waUrl = WA_URL;
  protected readonly currentYear = new Date().getFullYear();

  /** Mobile hamburger drawer open state. Closed on route navigation. */
  protected readonly menuOpen = signal(false);
  /** Stamp the current top-level path on the body so route-aware
      siblings (sticky WA, scroll-top) can react via [data-route]. */
  protected readonly routeKey = signal<string>('home');
  /** True once the page has scrolled past 80px — flips header to
      opaque white-with-shadow. */
  protected readonly scrolled = signal(false);

  /** Refs used to return focus to the hamburger when the drawer
      closes — keyboard users expect focus restoration after a modal
      surface dismisses (WCAG 2.4.3). */
  @ViewChild('hamburgerBtn') private hamburgerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('drawerCloseBtn') private drawerCloseBtn?: ElementRef<HTMLButtonElement>;

  ngOnInit(): void {
    this.seo.applyRootJsonLd();

    /* Auto-close the drawer on every successful navigation, and update
       the routeKey so siblings know which page we're on (used to hide
       the floating sticky WA on /products/:slug where the sticky-bottom
       bar provides the same action). */
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.menuOpen.set(false);
        const top = e.urlAfterRedirects.split('?')[0].split('/').filter(Boolean);
        this.routeKey.set(top[0] ? (top[0] === 'products' && top.length > 1 ? 'product-detail' : top[0]) : 'home');
        if (isPlatformBrowser(this.platformId)) {
          document.body.dataset['route'] = this.routeKey();
          /* Routes that lead with a dark-green hero get a class on
             <html> so the html background is dark green too. */
          const darkHero = ['home', 'products', 'wholesale', 'about', 'contact', 'why-rathika'].includes(this.routeKey());
          document.documentElement.classList.toggle('rt-dark-hero', darkHero);
          /* Coordinate Lenis with Angular Router on route change. */
          this.lenis.scrollToTop({ immediate: true });
        }
      });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    /* Lenis smooth-scroll — initialised browser-only, after view paints
       so it can read the document height correctly. */
    this.lenis.init();
    /* Header opacity threshold — flip to "scrolled" state only AFTER
       the user has cleared the dark hero (which is 60-72vh tall). At
       80px the header used to flip to mint while the user was still
       inside the dark hero, creating a jarring light strip against
       the dark page bg. Threshold = 55vh covers the desktop hero
       (72vh × 0.76) and mobile hero (60vh × 0.92).
       Throttled via rAF so a scroll burst at 60fps still only
       triggers ONE signal write per frame; the Angular signal no-ops
       set() calls that don't change the value, so CD only fires at
       the threshold crossing. */
    let scrollPending = false;
    const onScroll = () => {
      if (scrollPending) return;
      scrollPending = true;
      requestAnimationFrame(() => {
        scrollPending = false;
        const threshold = window.innerHeight * 0.55;
        this.scrolled.set(window.scrollY > threshold);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      this.lenis.destroy();
    });
  }

  protected toggleMenu(): void {
    const willOpen = !this.menuOpen();
    this.menuOpen.set(willOpen);
    if (willOpen) {
      /* Move focus into the drawer once it's rendered. setTimeout 0
         lets the @if branch render the close button before we focus. */
      setTimeout(() => this.drawerCloseBtn?.nativeElement.focus(), 0);
    }
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    /* Return focus to the hamburger that opened the drawer
       (WCAG 2.4.3 Focus Order). Keyboard users land back where they
       started instead of the document body. */
    this.hamburgerBtn?.nativeElement.focus();
  }

  /** Esc closes the drawer. Listens at document level so it works
      regardless of where focus currently is — common modal pattern. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  protected getRouteKey(): string {
    return this.contexts.getContext('primary')?.route?.url.toString() ?? 'root';
  }
}
