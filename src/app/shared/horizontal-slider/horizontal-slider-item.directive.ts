import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Marks an element as a slide for HorizontalSliderComponent. Lets the
 * slider query its slides without forcing a specific tag — anchor,
 * button, or div all work. The slider needs a real DOM ref so it can
 * call scrollIntoView and observe intersections.
 */
@Directive({
  selector: '[appHorizontalSliderItem]',
  standalone: true,
  host: {
    'data-slot': 'slider-item',
    class: 'slider-item',
  },
})
export class HorizontalSliderItemDirective {
  readonly host = inject(ElementRef<HTMLElement>);
}
