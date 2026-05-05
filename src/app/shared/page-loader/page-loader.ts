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

@Component({
  selector: 'app-page-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Top progress bar — fires on every navigation start -->
    <div
      class="bar"
      [class.is-loading]="loading()"
      role="progressbar"
      aria-label="Page loading"
      aria-hidden="true"></div>

    <!-- Initial-load splash — only shows once, on the very first paint -->
    @if (initial()) {
      <div class="splash" [class.is-out]="splashOut()" aria-hidden="true">
        <div class="splash__mark">
          <img src="assets/brand/logo.jpeg" width="64" height="64" alt="" />
        </div>
        <div class="splash__spinner"></div>
      </div>
    }
  `,
  styleUrl: './page-loader.scss',
})
export class PageLoaderComponent implements OnInit {
  protected readonly loading = signal(false);
  protected readonly initial = signal(true);
  protected readonly splashOut = signal(false);

  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.initial.set(false);
      return;
    }

    /* Initial splash: visible briefly on first paint, then fades out.
       Two-step (fade then unmount) so the fade-out is visible. */
    setTimeout(() => this.splashOut.set(true), 650);
    setTimeout(() => this.initial.set(false), 1100);

    /* Top progress bar on every route change */
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e) => {
        if (e instanceof NavigationStart) {
          this.loading.set(true);
        } else if (
          e instanceof NavigationEnd ||
          e instanceof NavigationCancel ||
          e instanceof NavigationError
        ) {
          /* Small delay so the bar visibly completes before disappearing */
          setTimeout(() => this.loading.set(false), 280);
        }
      });
  }
}
