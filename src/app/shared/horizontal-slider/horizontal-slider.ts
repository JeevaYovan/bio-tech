import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  ViewChild,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { HorizontalSliderItemDirective } from './horizontal-slider-item.directive';

/**
 * Horizontal scroll-snap slider — REBUILD §10 + category-section redesign.
 *
 * Base scroll: pure CSS scroll-snap (touch users get native momentum).
 * The TS layer drives:
 *   • desktop prev/next button enable/disable + click
 *   • indicator (dots OR progress bar) tracking via scroll position
 *   • keyboard arrow ↔ scrollPrev/scrollNext
 *   • optional auto-scroll (`[autoScroll]="ms"`):
 *       - first advance fires ~1.2 s after view init
 *       - paused while pointer hovers OR after a tap/click — resumes
 *         3 s later, so the rail keeps rotating continuously
 *       - with `loop`, wraps to start at the end → infinite rotation
 *       - skipped under prefers-reduced-motion
 */
@Component({
  selector: 'app-horizontal-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './horizontal-slider.html',
  styleUrl: './horizontal-slider.scss',
  host: {
    role: 'region',
    '[attr.aria-label]': 'ariaLabel()',
    '[class.has-fade]': 'edgeFade()',
  },
})
export class HorizontalSliderComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  readonly ariaLabel = input.required<string>();
  /** Auto-scroll cadence in ms. 0 = off (default). */
  readonly autoScroll = input(0);
  /** Wrap to first card after the last when paginating forward. */
  readonly loop = input(false, { transform: booleanAttribute });
  /** Show progress bar instead of dots. */
  readonly progressBar = input(false, { transform: booleanAttribute });
  /** Soft right-edge fade hinting "more content this way". */
  readonly edgeFade = input(true, { transform: booleanAttribute });
  /** How long auto-scroll stays paused after a user tap/click (ms). */
  readonly resumeAfter = input(3000);

  protected readonly items = contentChildren(HorizontalSliderItemDirective);

  protected readonly count = computed(() => this.items().length);
  protected readonly current = signal(0);
  protected readonly canPrev = signal(false);
  protected readonly canNext = signal(true);
  protected readonly progress = signal(0);
  protected readonly progressPercent = computed(() => Math.round(this.progress() * 100));
  protected readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('viewport', { static: true })
  private viewport!: ElementRef<HTMLDivElement>;

  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private firstAutoTimeout: ReturnType<typeof setTimeout> | null = null;
  /** Epoch ms until which auto-scroll is paused. */
  private pauseUntil = 0;
  /** Pointer is currently hovering — auto stays paused while this is true. */
  private hovering = false;
  private reduceMotion = false;

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    if (typeof window !== 'undefined') {
      this.reduceMotion = window
        .matchMedia?.('(prefers-reduced-motion: reduce)')
        .matches ?? false;
    }
    this.observeIntersections();
    fromEvent(this.viewport.nativeElement, 'scroll')
      .pipe(auditTime(60), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.recomputeIndicators());
    this.recomputeIndicators();
    this.startAuto();
    this.destroyRef.onDestroy(() => this.clearAllTimers());
  }

  private startAuto(): void {
    const ms = this.autoScroll();
    if (ms <= 0 || this.reduceMotion) return;

    /* First advance ~1.2 s after view init so users see motion fast.
       After the first tick, the regular interval takes over. */
    this.firstAutoTimeout = setTimeout(() => {
      this.autoAdvance();
      this.autoTimer = setInterval(() => this.autoAdvance(), ms);
    }, 1200);
  }

  /** User-driven goTo (dot/arrow click, keyboard). Pauses briefly so
      we don't yank the user off what they just selected, then resumes. */
  protected goTo(index: number): void {
    this.scrollToIndex(index);
    this.pauseAuto(this.resumeAfter());
  }

  protected scrollPrev(): void {
    const target = this.current() <= 0
      ? (this.loop() ? this.count() - 1 : 0)
      : this.current() - 1;
    this.goTo(target);
  }

  protected scrollNext(): void {
    const target = this.current() >= this.count() - 1
      ? (this.loop() ? 0 : this.count() - 1)
      : this.current() + 1;
    this.goTo(target);
  }

  /* Keyboard ←/→ — pauses but doesn't permanently stop. */
  @HostListener('keydown.arrowLeft', ['$event'])
  onLeft(e: Event): void {
    e.preventDefault();
    this.scrollPrev();
  }
  @HostListener('keydown.arrowRight', ['$event'])
  onRight(e: Event): void {
    e.preventDefault();
    this.scrollNext();
  }

  /* Tap or click anywhere on the rail — pauses for `resumeAfter` ms,
     then auto-rotation continues. */
  @HostListener('pointerdown')
  @HostListener('touchstart')
  onUserCommit(): void {
    this.pauseAuto(this.resumeAfter());
  }

  /* Hover — pause while inside, resume on leave. Doesn't apply on touch
     where pointerenter/leave don't reliably fire. */
  @HostListener('pointerenter')
  onPointerEnter(): void {
    this.hovering = true;
  }
  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.hovering = false;
    /* Brief settle-time after the cursor leaves so we don't immediately
       advance and surprise the user. */
    this.pauseAuto(800);
  }

  /** Auto-driven advance — runs only while not paused and not hovered. */
  private autoAdvance(): void {
    if (this.hovering) return;
    if (Date.now() < this.pauseUntil) return;
    const idx = this.current();
    const last = this.count() - 1;
    let next: number;
    if (idx >= last) {
      /* End of rail. Wrap to start with loop, otherwise leave the
         interval running but no-op so the user can re-engage from any
         position. */
      if (!this.loop()) return;
      next = 0;
    } else {
      next = idx + 1;
    }
    this.scrollToIndex(next);
  }

  /** Internal scroll — used by both user and auto paths.
      Uses viewport.scrollTo (NOT element.scrollIntoView) so the
      rail's auto-rotation never bubbles up to scroll the parent
      page. scrollIntoView with `block: 'nearest'` *can* scroll an
      ancestor when the slider sits partially below the fold, which
      would yank a user reading another section back to the rail. */
  private scrollToIndex(index: number): void {
    const itemEls = this.items().map((d) => d.host.nativeElement);
    const target = itemEls[index];
    if (!target) return;
    const v = this.viewport.nativeElement;
    /* Distance between the target's left edge and the viewport's left
       edge, then add to the current scrollLeft. CSS scroll-snap
       (mandatory) will land the final position on the nearest snap. */
    const offset =
      target.getBoundingClientRect().left - v.getBoundingClientRect().left;
    v.scrollTo({
      left: v.scrollLeft + offset,
      behavior: this.reduceMotion ? 'auto' : 'smooth',
    });
    this.current.set(index);
  }

  private pauseAuto(ms: number): void {
    this.pauseUntil = Date.now() + ms;
  }

  private clearAllTimers(): void {
    if (this.firstAutoTimeout) {
      clearTimeout(this.firstAutoTimeout);
      this.firstAutoTimeout = null;
    }
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private observeIntersections(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    const itemEls = this.items().map((d) => d.host.nativeElement);
    if (itemEls.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = itemEls.indexOf(entry.target as HTMLElement);
            if (idx >= 0) this.current.set(idx);
          }
        }
      },
      { root: this.viewport.nativeElement, threshold: [0.6] },
    );
    for (const el of itemEls) io.observe(el);
    this.destroyRef.onDestroy(() => io.disconnect());
  }

  private recomputeIndicators(): void {
    const v = this.viewport.nativeElement;
    const max = v.scrollWidth - v.clientWidth;
    this.canPrev.set(v.scrollLeft > 4);
    this.canNext.set(v.scrollLeft < max - 4);
    this.progress.set(max > 0 ? Math.min(1, Math.max(0, v.scrollLeft / max)) : 0);
  }
}
