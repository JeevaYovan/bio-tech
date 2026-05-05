import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="eyebrow">{{ label() }}</span>`,
})
export class SectionBadgeComponent {
  readonly label = input.required<string>();
}
