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

        /* Split into words, render each word as a single inline-block
           with white-space:nowrap so characters never break mid-word.
           Words are joined with a regular space (NOT &nbsp;) so the
           browser has a real break opportunity between them — this is
           what allows the heading to wrap to multiple visual lines.
           Previously we used a `<span class="kt-space">&nbsp;</span>`
           between words, which: (1) used a non-breaking space, (2) had
           no whitespace in the source between sibling spans, so the
           browser had zero break opportunities and the entire heading
           tried to render on one line, with overflow then clipped by
           `.kt-line { overflow: hidden }`. */
        const words = text.split(/\s+/).filter(Boolean);
        const wordHtml = words.map((word: string) => {
          const chars = Array.from(word)
            .map((ch: string) => `<span class="kt-char">${escape(ch)}</span>`)
            .join('');
          return `<span class="kt-word">${chars}</span>`;
        }).join(' ');

        return `<span class="kt-line">${wordHtml}</span>`;
      })
      .join('');

    const lineEls: NodeListOf<HTMLElement> = host.querySelectorAll('.kt-line');
    const wordEls: NodeListOf<HTMLElement> = host.querySelectorAll('.kt-word');
    const charEls: NodeListOf<HTMLElement> = host.querySelectorAll('.kt-char');

    /* Line is the masking box. Allow normal text wrapping inside it
       — multi-line headings get correct visual heights, while the
       overflow:hidden masks each char's translateY(120%) starting
       position before the rise tween fires. */
    lineEls.forEach((el: HTMLElement) => {
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.lineHeight = 'inherit';
    });
    /* Word is non-breaking — characters within a word never split
       across visual lines, but the browser CAN wrap between words
       (the regular-space join in the innerHTML above). */
    wordEls.forEach((el: HTMLElement) => {
      el.style.display = 'inline-block';
      el.style.whiteSpace = 'nowrap';
      el.style.lineHeight = 'inherit';
    });
    charEls.forEach((el: HTMLElement) => {
      el.style.display = 'inline-block';
      el.style.transform = 'translateY(120%)';
      el.style.willChange = 'transform';
    });

    /* Build the rise tween but DO NOT start it yet — we kick it
       manually based on viewport visibility. */
    const tween = gsap.to(Array.from(charEls), {
      y: 0,
      duration: this.kineticDuration / 1000,
      ease: 'power3.out',
      stagger: this.kineticStagger / 1000,
      paused: true,
      onComplete: () => {
        charEls.forEach((el: HTMLElement) => { el.style.willChange = 'auto'; });
      },
    });

    /* Fire mechanism — single-shot, defensive against the timing
       issue that broke renders during route changes:
       1. If the host is already in the viewport at registration
          time (typical for above-the-fold heroes), fire immediately
          on the next frame. No reliance on ScrollTrigger / Lenis
          settling.
       2. Otherwise observe via the shared IntersectionObserver pool
          and fire on first intersection. */
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      tween.play();
    };

    const rect = host.getBoundingClientRect();
    const inViewportNow = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewportNow) {
      requestAnimationFrame(play);
    }

    /* Always observe too — covers the case where the host starts
       offscreen (e.g. a kinetic h2 mid-page). Cheap because IO is
       pooled. The play() guard ensures we don't double-fire if
       inViewportNow already triggered. */
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
