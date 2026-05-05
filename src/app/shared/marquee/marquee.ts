import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-marquee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee" [attr.aria-label]="ariaLabel()">
      <div class="marquee__track" [style.animation-duration.s]="duration()">
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
  readonly duration = input<number>(40);
  readonly ariaLabel = input<string>('');
}
