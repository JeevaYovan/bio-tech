import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { WA_URL } from '../../shared/constants';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ParallaxImageDirective } from '../../shared/parallax-image/parallax-image.directive';
import { KineticTextDirective } from '../../shared/kinetic-text/kinetic-text.directive';
import { TimelineComponent, TimelineEntry } from '../../shared/timeline/timeline';
import { NatureParallaxHeroComponent } from '../../shared/nature-parallax-hero/nature-parallax-hero';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    SectionBadgeComponent,
    RevealOnScrollDirective,
    ParallaxImageDirective,
    KineticTextDirective,
    TimelineComponent,
    NatureParallaxHeroComponent,
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export default class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly waUrl = WA_URL;

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'How Rathika Biotech Products turns banana fiber, sugarcane bagasse, and rice husk into biodegradable tableware at the Neelambur workshop in Coimbatore, Tamil Nadu.',
      canonicalPath: '/about/',
      ogTitle: 'Our Story — Banana Fiber Tableware from Tamil Nadu | Rathika',
    });
  }

  protected readonly revealDelayFor = revealDelayFor;

  /** Workshop milestones — narrative anchors for the journey. */
  protected readonly milestones: ReadonlyArray<TimelineEntry> = [
    {
      year: '2019',
      title: 'A small workshop, a stubborn idea',
      description:
        'Rathika begins as a kitchen-counter trial: can banana fiber and bagasse be pressed into a plate strong enough to hold sambar? The first hand-press goes up behind the family home in Neelambur.',
    },
    {
      year: '2020',
      title: 'First carton ships',
      description:
        'A neighbouring caterer in Avinashi Road takes a trial run of partition plates for a wedding. The plates clear the night without leaking. Word travels.',
    },
    {
      year: '2022',
      title: 'A real product line',
      description:
        'Eight SKUs go on the menu — cups, bowls, plates, parcel boxes. The press is upgraded; QC is signed off carton by carton. Restaurants in Coimbatore start re-ordering monthly.',
    },
    {
      year: '2024',
      title: 'Beyond the city',
      description:
        'Wholesale orders start travelling — Tiruppur, Erode, Salem, then Chennai. Custom-embossed wedding cartons become a steady seasonal line.',
    },
    {
      year: '2026',
      title: 'A catalog, a workshop, a phone line',
      description:
        'Fourteen SKUs across cups, bowls, plates, partition trays, and parcel boxes. One press, one number, one promise: agricultural waste in, tableware out, no chemicals on the path between.',
    },
  ];
}
