import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { RevealOnScrollDirective } from '../reveal/reveal-on-scroll.directive';

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealOnScrollDirective],
  template: `
    <ul class="faq" role="list">
      @for (item of items(); track item.q; let i = $index) {
        <li class="faq__item"
            [class.is-open]="open() === i"
            revealOnScroll
            [revealDelay]="i * 60">
          <button
            type="button"
            class="faq__head"
            [attr.aria-expanded]="open() === i"
            [attr.aria-controls]="'faq-panel-' + i"
            [id]="'faq-head-' + i"
            (click)="toggle(i)">
            <span class="faq__q">{{ item.q }}</span>
            <span class="faq__icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M3 8h10M8 3v10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
          </button>
          <div
            class="faq__panel"
            [id]="'faq-panel-' + i"
            role="region"
            [attr.aria-labelledby]="'faq-head-' + i"
            [attr.hidden]="open() === i ? null : ''">
            <p class="faq__a">{{ item.a }}</p>
          </div>
        </li>
      }
    </ul>
  `,
  styleUrl: './faq-accordion.scss',
})
export class FaqAccordionComponent {
  readonly items = input.required<readonly FaqItem[]>();
  protected readonly open = signal<number | null>(0);

  protected toggle(i: number): void {
    this.open.set(this.open() === i ? null : i);
  }
}
