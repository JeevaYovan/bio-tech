import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { WA_URL } from '../../shared/constants';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { StatsCounterComponent } from '../../shared/stats-counter/stats-counter';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { NatureParallaxHeroComponent } from '../../shared/nature-parallax-hero/nature-parallax-hero';
import { MagneticDirective } from '../../shared/magnetic/magnetic.directive';
import { TiltDirective } from '../../shared/tilt/tilt.directive';
import { KineticTextDirective } from '../../shared/kinetic-text/kinetic-text.directive';
import { WordRevealDirective } from '../../shared/word-reveal/word-reveal.directive';
import { MegaCtaDirective } from '../../shared/mega-cta/mega-cta.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

interface Ingredient {
  readonly name: string;
  readonly source: string;
  readonly role: string;
  readonly imageSlug: string;
}

interface Pillar {
  readonly icon: string;
  readonly title: string;
  readonly body: string;
}

@Component({
  selector: 'app-why-rathika',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    SectionBadgeComponent,
    StatsCounterComponent,
    RevealOnScrollDirective,
    NatureParallaxHeroComponent,
    MagneticDirective,
    TiltDirective,
    KineticTextDirective,
    WordRevealDirective,
    MegaCtaDirective,
  ],
  templateUrl: './why-rathika.html',
  styleUrl: './why-rathika.scss',
})
export default class WhyRathikaComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly waUrl = WA_URL;
  protected readonly revealDelayFor = revealDelayFor;

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Rathika Biotech upcycles banana fiber, sugarcane bagasse, and rice husk into biodegradable tableware. Zero-waste manufacturing, no chemicals, low carbon, animal-safe.',
      canonicalPath: '/why-rathika/',
      ogTitle: 'Why Rathika — Upcycling Farm Waste into Tableware',
    });
  }

  /** Five inputs we use, with the role each plays in the press. */
  protected readonly ingredients: ReadonlyArray<Ingredient> = [
    {
      name: 'Banana fiber',
      source: 'From the pseudo-stem after the fruit is cut.',
      role: 'Naturally tensile. Acts as the primary binder in our cup and bowl presses.',
      imageSlug: 'lifestyle/story-fiber-texture',
    },
    {
      name: 'Sugarcane bagasse',
      source: 'Leftover residue after extraction of juices and is burned by industries as a fuel.',
      role: 'Light, insulating. Gives parcel boxes and cups their structural body.',
      imageSlug: 'workshop/bowls-cluster-sunlit',
    },
    {
      name: 'Rice husk',
      source: 'Byproduct of paddy crop which is otherwise burned.',
      role: 'Adds rigidity to plates and partition trays without making them brittle.',
      imageSlug: 'workshop/nested-plates-spoons',
    },
    {
      name: 'Rice bran',
      source: 'A by-product from rice polishing.',
      role: 'Helps bind the press at low temperatures; also acts as a release agent.',
      imageSlug: 'workshop/packing-partition-plates',
    },
    {
      name: 'Rice straw',
      source: 'Byproduct of paddy crop which is also burned.',
      role: 'The bulk fiber for thicker plates and ceremonial pieces.',
      imageSlug: 'workshop/square-box-four-spoons',
    },
  ];

  /** Three pillars the manufacturing system is built on. */
  protected readonly pillars: ReadonlyArray<Pillar> = [
    {
      icon: '01',
      title: 'Zero-waste process',
      body:
        'Our facility does not produce any form of solid or liquid waste. Our Neelambur workshop runs a closed loop. Trim, off-cuts, and rejected presses are remixed back into the binder feed for the next batch.',
    },
    {
      icon: '02',
      title: 'Low carbon footprint',
      body:
        'Manufacturing one kilogram of plastic releases between 6 and 18 kilograms of CO₂. The same volume of our pressed-fiber tableware releases roughly 90% less, because the inputs were already going to be burned in the field.',
    },
    {
      icon: '03',
      title: 'Zero chemicals used',
      body:
        'None whatsoever. Only Agricultural Waste. No paint, no plastic film, no synthetic binder, no chemical sealer. The tableware is heat, pressure, fiber, and natural starch.',
    },
  ];
}
