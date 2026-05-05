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
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  readonly duration = input<number>(1800);

  protected readonly display = signal<string>('0');
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    const target = this.to();
    this.display.set(this.format(target));
    if (!isPlatformBrowser(this.platformId)) return;
    if (!('IntersectionObserver' in window)) return;

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

  private animate(target: number): void {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      this.display.set(this.format(target));
      return;
    }
    const start = performance.now();
    const dur = this.duration();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      this.display.set(this.format(Math.round(target * eased)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  private format(n: number): string {
    return n.toLocaleString('en-IN');
  }
}
