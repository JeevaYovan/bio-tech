import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { WA_URL } from '../../shared/constants';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { RevealDirective } from '../../shared/reveal.directive';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionBadgeComponent, RevealDirective, RevealOnScrollDirective],
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
}
