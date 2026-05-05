import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Top-of-page progress bar that fires on every router navigation.
 * No full-screen splash: the site is statically prerendered so HTML is
 * available immediately — covering it with an overlay would only delay
 * the LCP. The bar is decorative; navigation start/end is communicated
 * to AT via the Router itself (no aria-live needed for SPA route
 * transitions on a prerendered site).
 */
@Component({
  selector: 'app-page-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" [class.is-loading]="loading()" aria-hidden="true"></div>
  `,
  styleUrl: './page-loader.scss',
})
export class PageLoaderComponent implements OnInit {
  protected readonly loading = signal(false);

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Pending hide-bar timer; cleared on subsequent NavigationStart and
   *  on component destroy so callbacks don't fire on a stale signal. */
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        if (e instanceof NavigationStart) {
          this.clearHideTimer();
          this.loading.set(true);
        } else if (
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError
        ) {
          this.clearHideTimer();
          this.hideTimer = setTimeout(() => {
            this.loading.set(false);
            this.hideTimer = null;
          }, 280);
        }
      });

    this.destroyRef.onDestroy(() => this.clearHideTimer());
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
