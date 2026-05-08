import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { LenisScrollService } from '../lenis-scroll/lenis-scroll.service';

/**
 * Continuous-scroll marquee band.
 *
 * Velocity-sensitive: subscribes to `LenisScrollService.velocity()` and
 * shortens its animation-duration when the page is scrolling fast,
 * giving the impression that the user is "pushing" the marquee. Also
 * flips direction when the user scrolls upward.
 *
 * Soft edge-fade mask applied via CSS in marquee.scss.
 */
@Component({
  selector: 'app-marquee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee" [attr.aria-label]="ariaLabel()">
      <div
        class="marquee__track"
        [class.is-reverse]="reverse()"
        [style.animation-duration.s]="effectiveDuration()">
        @for (item of items(); track $index) {
          <span class="marquee__item">{{ item }}</span>
          <span class="marquee__sep" aria-hidden="true">✦</span>
        }
        @for (item of items(); track $index) {
          <span class="marquee__item" aria-hidden="true">{{ item }}</span>
          <span class="marquee__sep" aria-hidden="true">✦</span>
        }
      </div>
    </div>
  `,
  styleUrl: './marquee.scss',
})
export class MarqueeComponent {
  readonly items = input.required<readonly string[]>();
  readonly duration = input<number>(45);
  readonly ariaLabel = input<string>('');

  private readonly lenis = inject(LenisScrollService);

  /** Effective duration in seconds, modulated by scroll velocity.
   *  At rest (velocity ≈ 0): full base duration.
   *  Fast scroll: clamp to 1/3 of base for max acceleration. */
  protected readonly effectiveDuration = computed(() => {
    const base = this.duration();
    const v = Math.abs(this.lenis.velocity());
    /* Velocity is typically 0..50 px/frame on aggressive scroll; the
     * 0.6 multiplier and clamp keep the marquee from going feral. */
    const factor = Math.max(0.33, 1 / (1 + v * 0.6));
    return base * factor;
  });

  /** When user scrolls upward (negative velocity), flip the marquee
   *  direction so the items appear to "pull back" with the gesture. */
  protected readonly reverse = computed(() => this.lenis.velocity() < -1);
}
