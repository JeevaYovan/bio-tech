import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  signal,
  viewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Stats counter — supports two modes:
 *
 * 1. Default (`scrollScrubbed: false`): IntersectionObserver triggers
 *    the count-up animation once when the host scrolls into view.
 *    Number animates 0 → target over `duration` ms with cubic ease-out.
 *
 * 2. Scrubbed (`[scrollScrubbed]="true"`): the number is *driven* by
 *    scroll position. As the user scrolls through the host's viewport
 *    range (via GSAP ScrollTrigger), the displayed number scrubs from
 *    0 → target. Reverse scroll → number scrubs back down. Useful in
 *    narrative sections where the stat should feel tied to the prose.
 *
 * Both modes are SSR-safe and respect `prefers-reduced-motion`
 * (number renders at final value immediately).
 */
@Component({
  selector: 'app-stats-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #host class="stat">
      <p class="stat__value">
        <span class="stat__num">{{ display() }}</span><span class="stat__suffix">{{ suffix() }}</span>
      </p>
      <p class="stat__label">{{ label() }}</p>
      @if (note()) {
        <p class="stat__note">{{ note() }}</p>
      }
    </div>
  `,
  styleUrl: './stats-counter.scss',
})
export class StatsCounterComponent implements AfterViewInit {
  readonly to = input.required<number>();
  readonly suffix = input<string>('');
  readonly label = input.required<string>();
  readonly note = input<string>('');
  readonly duration = input<number>(1100);
  /** When true, the number scrubs 0 → target as the user scrolls
   *  through the host's viewport range (via GSAP ScrollTrigger). */
  readonly scrollScrubbed = input<boolean>(false);

  protected readonly display = signal<string>('0');
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    const target = this.to();
    this.display.set(this.format(target));
    if (!isPlatformBrowser(this.platformId)) return;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      /* Static — leave at final value, skip both modes. */
      return;
    }

    if (this.scrollScrubbed()) {
      this.bootScrubbed(target);
    } else if ('IntersectionObserver' in window) {
      this.bootIntersection(target);
    }
  }

  /** IntersectionObserver-driven count-up (legacy mode). */
  private bootIntersection(target: number): void {
    this.display.set('0');
    const el = this.host().nativeElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            io.unobserve(el);
            this.animate(target);
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    this.destroyRef.onDestroy(() => io.disconnect());
  }

  /** ScrollTrigger-driven scrub (Pattern 4 from the brief). */
  private bootScrubbed(target: number): void {
    this.display.set('0');
    const el = this.host().nativeElement;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 30%',
      scrub: 1,
      onUpdate: (self) => {
        const value = Math.round(target * self.progress);
        this.display.set(this.format(value));
        this.cdr.markForCheck();
      },
    });
    this.destroyRef.onDestroy(() => trigger.kill());
  }

  private animate(target: number): void {
    const start = performance.now();
    const dur = this.duration();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      this.display.set(this.format(Math.round(target * eased)));
      this.cdr.markForCheck();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private format(n: number): string {
    return n.toLocaleString('en-IN');
  }
}
