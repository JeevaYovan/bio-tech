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
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Character-stagger reveal — splits the host element's text into one
 * span per character (preserving spaces and `<br>` boundaries), then
 * animates each span from `y: 120%` to `y: 0` with a tight stagger.
 *
 * Triggered by ScrollTrigger when the host enters the viewport. Fires
 * once. SSR-safe; reduced-motion bypass.
 *
 * Usage:
 *   <h1 appKineticText>From the soil,<br />back to the soil.</h1>
 */
@Directive({
  selector: '[appKineticText]',
  standalone: true,
})
export class KineticTextDirective implements AfterViewInit {
  /** Stagger between characters (ms). */
  @Input() kineticStagger = 30;
  /** Animation duration per character (ms). */
  @Input() kineticDuration = 800;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const host = this.el.nativeElement;
    const html = host.innerHTML;

    /* a11y: stash the original text content as an aria-label on the
       host BEFORE we shred the DOM into per-character spans. This
       gives screen readers a stable, contiguous accessible name
       regardless of how the children mutate. Without this, the
       computed accessible name walks 60+ individual char spans which,
       while AT-equivalent today, is fragile (SC 1.3.1 / 4.1.2). */
    const originalText = (host.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (originalText && !host.hasAttribute('aria-label')) {
      host.setAttribute('aria-label', originalText);
    }

    /* Tokenise: split on <br> first (those preserve the line break),
       then split each line into characters preserving non-breaking
       spaces. We render the lines as block-level mask boxes; the
       characters within are inline-block so they can transform. */
    const lines: string[] = html.split(/<br\s*\/?>/i);

    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    /* Strip any HTML tags we don't want re-rendered as text. We accept
       only plain text content for kinetic reveal. Inner HTML mark-up
       beyond <br> is not preserved. */
    const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');

    /* Decode HTML entities so &amp; becomes & */
    const decodeHtml = (htmlStr: string) => {
      const txt = document.createElement('textarea');
      txt.innerHTML = htmlStr;
      return txt.value;
    };

    host.innerHTML = lines
      .map((line: string) => {
        const text = decodeHtml(stripTags(line));
        
        // Split by words to keep characters of a word from breaking across lines
        const words = text.split(' ');
        const wordHtml = words.map((word: string) => {
          const chars = Array.from(word)
            .map((ch: string) => `<span class="kt-char">${escape(ch)}</span>`)
            .join('');
          return `<span class="kt-word" style="display: inline-block; white-space: nowrap;">${chars}</span>`;
        }).join('<span class="kt-space" style="display: inline-block;">&nbsp;</span>');
        
        return `<span class="kt-line">${wordHtml}</span>`;
      })
      .join('');

    const lineEls: NodeListOf<HTMLElement> = host.querySelectorAll('.kt-line');
    const charEls: NodeListOf<HTMLElement> = host.querySelectorAll('.kt-char');

    lineEls.forEach((el: HTMLElement) => {
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.lineHeight = 'inherit';
    });
    charEls.forEach((el: HTMLElement) => {
      el.style.display = 'inline-block';
      el.style.transform = 'translateY(120%)';
      el.style.willChange = 'transform';
    });

    const tween = gsap.to(Array.from(charEls), {
      y: 0,
      duration: this.kineticDuration / 1000,
      ease: 'power3.out',
      stagger: this.kineticStagger / 1000,
      /* Drop will-change once the cascade completes — characters don't
         need to stay on their own compositor layer indefinitely (perf
         agent / code review nit). */
      onComplete: () => {
        charEls.forEach((el: HTMLElement) => { el.style.willChange = 'auto'; });
      },
      scrollTrigger: {
        trigger: host,
        start: 'top 85%',
        once: true,
      },
    });

    this.destroyRef.onDestroy(() => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
  }
}
