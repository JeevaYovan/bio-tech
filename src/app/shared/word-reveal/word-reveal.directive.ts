import {
  AfterViewInit,
  Directive,
  DestroyRef,
  ElementRef,
  Input,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { observe } from '../observer-pool/observer-pool';

/**
 * Word-by-word reveal — splits the host's text content into a span per
 * word, wraps them in overflow-hidden boxes, and animates each word
 * from y:100% to 0 with a small stagger when the host enters viewport.
 *
 * Distinct from MaskRevealDirective (which splits on `<br>` for headings)
 * and KineticTextDirective (which splits per character). Use this on
 * body paragraphs where word granularity feels right.
 *
 * SSR-safe; reduced-motion bypass.
 */
@Directive({
  selector: '[appWordReveal]',
  standalone: true,
})
export class WordRevealDirective implements AfterViewInit {
  /** Stagger between words, ms. */
  @Input() wordStagger = 25;
  /** Animation duration per word, ms. */
  @Input() wordDuration = 400;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const host = this.el.nativeElement;
    /* Strip down to text-only — we don't preserve nested HTML in this
       reveal (use [appKineticText] if you need <br> support). */
    const text = host.textContent ?? '';
    if (!text.trim()) return;

    /* a11y: pin the original text as the host's accessible name BEFORE
       we shred it into per-word spans. Same rationale as
       [appKineticText]: the computed name from per-word spans is
       AT-equivalent today but fragile under future child mutations. */
    const accessibleName = text.replace(/\s+/g, ' ').trim();
    if (accessibleName && !host.hasAttribute('aria-label')) {
      host.setAttribute('aria-label', accessibleName);
    }

    const words = text.split(/(\s+)/).filter((w: string) => w.length > 0);

    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    host.innerHTML = words
      .map((w: string) => {
        if (/^\s+$/.test(w)) return w;
        return `<span class="wr-word"><span class="wr-inner">${escape(w)}</span></span>`;
      })
      .join('');

    const wordEls: NodeListOf<HTMLElement> = host.querySelectorAll('.wr-word');
    const innerEls: NodeListOf<HTMLElement> = host.querySelectorAll('.wr-inner');

    wordEls.forEach((el: HTMLElement) => {
      el.style.display = 'inline-block';
      el.style.overflow = 'hidden';
      el.style.verticalAlign = 'top';
      el.style.lineHeight = 'inherit';
    });
    innerEls.forEach((el: HTMLElement) => {
      el.style.display = 'inline-block';
      el.style.transform = 'translateY(110%)';
      el.style.willChange = 'transform';
    });

    /* Build the rise tween in paused state and trigger it manually.
       Same pattern as [appKineticText] — using ScrollTrigger here
       was unreliable on route navigation: when Lenis was mid-scroll-
       to-top, the trigger sometimes failed to fire and the words
       stayed at translateY(110%) (invisible inside their masks).
       Reproduced as "page is blank, refresh shows it". The
       immediate-fire path below covers that case. */
    const tween = gsap.to(Array.from(innerEls), {
      y: 0,
      duration: this.wordDuration / 1000,
      ease: 'power3.out',
      stagger: this.wordStagger / 1000,
      paused: true,
      onComplete: () => {
        innerEls.forEach((el: HTMLElement) => { el.style.willChange = 'auto'; });
      },
    });

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      tween.play();
    };

    /* If the host is already in the viewport at registration time
       (above-the-fold paragraphs after a route change), play
       immediately on the next frame. */
    const rect = host.getBoundingClientRect();
    const inViewportNow = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewportNow) {
      requestAnimationFrame(play);
    }

    /* Below-the-fold paragraphs: register with the shared IO pool
       and fire on first intersection. play()'s `played` guard
       prevents double-firing if both paths trigger. */
    const unobserve = observe(host, 0.05, '0px 0px -10% 0px', (entry) => {
      if (entry.isIntersecting) {
        play();
        unobserve();
      }
    });

    this.destroyRef.onDestroy(() => {
      unobserve();
      tween.kill();
    });
  }
}
