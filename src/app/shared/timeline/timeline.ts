import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface TimelineEntry {
  readonly year: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Vertical timeline with a scroll-drawn stroke line and node pop-ins.
 *
 * As the user scrolls through the section, a vertical stroke line on
 * the left "draws" itself via stroke-dashoffset. Each timeline node
 * scales 0 → 1 + fades in as scroll reaches it.
 *
 * Mobile: same vertical layout with smaller node size.
 * Reduced-motion: line static, all nodes visible from start.
 */
@Component({
  selector: 'app-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tl" #host>
      <svg class="tl__line" preserveAspectRatio="none" aria-hidden="true">
        <line #line x1="50%" y1="0" x2="50%" y2="100%"
              stroke="var(--color-accent)" stroke-width="2"
              stroke-linecap="round" />
      </svg>
      <ol class="tl__items" role="list">
        @for (item of items(); track item.year; let i = $index) {
          <li class="tl__item" [attr.data-i]="i">
            <span class="tl__node" aria-hidden="true"></span>
            <div class="tl__content">
              <span class="tl__year">{{ item.year }}</span>
              <h3 class="tl__title">{{ item.title }}</h3>
              <p class="tl__body">{{ item.description }}</p>
            </div>
          </li>
        }
      </ol>
    </div>
  `,
  styleUrl: './timeline.scss',
})
export class TimelineComponent implements AfterViewInit {
  readonly items = input.required<readonly TimelineEntry[]>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly line = viewChild.required<ElementRef<SVGLineElement>>('line');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const hostEl = this.host().nativeElement;
    const lineEl = this.line().nativeElement;
    const nodeEls = hostEl.querySelectorAll<HTMLElement>('.tl__item');

    /* Stroke draw setup: dasharray = full length, dashoffset = full
       length, then scrub down to 0 as user scrolls through the section. */
    const length = lineEl.getTotalLength?.() ?? 1000;
    lineEl.style.strokeDasharray = `${length}`;
    lineEl.style.strokeDashoffset = `${length}`;

    /* Initial node state: hidden + scaled down. */
    gsap.set(nodeEls, { opacity: 0, scale: 0.6 });

    const lineTween = gsap.to(lineEl, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hostEl,
        start: 'top 80%',
        end: 'bottom 70%',
        scrub: 1,
      },
    });

    /* Each node pops in at its own scroll position. */
    const nodeTriggers: ScrollTrigger[] = [];
    nodeEls.forEach((el: HTMLElement) => {
      const tween = gsap.to(el, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.6)',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      });
      if (tween.scrollTrigger) nodeTriggers.push(tween.scrollTrigger);
    });

    this.destroyRef.onDestroy(() => {
      lineTween.scrollTrigger?.kill();
      lineTween.kill();
      nodeTriggers.forEach((t) => t.kill());
    });
  }
}
