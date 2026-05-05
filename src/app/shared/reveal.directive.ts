import {
  AfterViewInit,
  Directive,
  ElementRef,
  PLATFORM_ID,
  inject,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { '[attr.data-reveal]': '""' },
})
export class RevealDirective implements AfterViewInit {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.host.nativeElement;
    if (!('IntersectionObserver' in window)) {
      el.setAttribute('data-reveal-active', '');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute('data-reveal-active', '');
            io.unobserve(el);
          }
        }
      },
      { rootMargin: '-10% 0px -10% 0px', threshold: 0.05 },
    );
    io.observe(el);
    this.destroyRef.onDestroy(() => io.disconnect());
  }
}
