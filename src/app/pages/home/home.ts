import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { findProductBySlug, formatINR, type Product, type ProductCategory } from '../../../data/products';
import { SeoService } from '../../services/seo.service';
import { WA_URL } from '../../shared/constants';
import { HorizontalSliderComponent } from '../../shared/horizontal-slider/horizontal-slider';
import { HorizontalSliderItemDirective } from '../../shared/horizontal-slider/horizontal-slider-item.directive';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { MarqueeComponent } from '../../shared/marquee/marquee';
import { StatsCounterComponent } from '../../shared/stats-counter/stats-counter';
import { FaqAccordionComponent, type FaqItem } from '../../shared/faq-accordion/faq-accordion';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';
import { NatureParallaxHeroComponent } from '../../shared/nature-parallax-hero/nature-parallax-hero';
import { ScrollSequenceComponent, type SequenceFrame } from '../../shared/scroll-sequence/scroll-sequence';
import { MagneticDirective } from '../../shared/magnetic/magnetic.directive';
import { TiltDirective } from '../../shared/tilt/tilt.directive';
import { ParallaxImageDirective } from '../../shared/parallax-image/parallax-image.directive';
import { MegaCtaDirective } from '../../shared/mega-cta/mega-cta.directive';
import { KineticTextDirective } from '../../shared/kinetic-text/kinetic-text.directive';
import { WordRevealDirective } from '../../shared/word-reveal/word-reveal.directive';

interface CategoryCard {
  readonly key: ProductCategory;
  readonly label: string;
  readonly eyebrow: string;
  readonly imageSlug: string;
  readonly alt: string;
}

interface HowStep {
  readonly n: string;
  readonly title: string;
  readonly body: string;
  readonly imageSlug: string;
  readonly alt: string;
  readonly intrinsic: { w: number; h: number };
}

interface FeaturedSpec {
  slug: string;
  imageSlug: string;
  alt: string;
  intrinsic: { w: number; h: number };
}

interface Featured extends Product {
  imageSlug: string;
  alt: string;
  intrinsic: { w: number; h: number };
  avifSrcset: string;
  webpSrcset: string;
  jpgSrcset: string;
  fallback: string;
  priceLabel: string;
}

interface Pillar {
  n: string;
  title: string;
  body: string;
  icon: string;
}

interface EcoTip {
  readonly tag: string;
  readonly title: string;
  readonly body: string;
  readonly date: string;
  readonly imageSlug: string;
  readonly alt: string;
}

interface AgroInput {
  readonly icon: string;   /* unicode/glyph or short letter for the card icon disc */
  readonly name: string;
  readonly source: string;
  readonly role: string;
}

interface TrustedSegment {
  readonly label: string;
  readonly hint: string;
}

const FEATURED_SPECS: ReadonlyArray<FeaturedSpec> = [
  { slug: 'tea-cup-100ml',        imageSlug: 'products/tea-cup-100ml',        alt: 'Three biodegradable bagasse tea cups stacked on a stone surface',          intrinsic: { w: 400, h: 534 } },
  { slug: 'parcel-box-300ml',     imageSlug: 'products/parcel-box-300ml',     alt: 'Round 300 ml biodegradable parcel box with lid on a desk',                  intrinsic: { w: 400, h: 300 } },
  { slug: 'partition-10x12',      imageSlug: 'products/partition-10x12',      alt: 'Stack of 10 by 12 inch partition plates with embossed Rathika logo',        intrinsic: { w: 400, h: 469 } },
  { slug: 'rectangle-box-300ml',  imageSlug: 'products/rectangle-box-300ml',  alt: 'Rectangular biodegradable parcel box with a bagasse spoon inside',          intrinsic: { w: 400, h: 300 } },
  { slug: 'spoon-5in',            imageSlug: 'products/spoon-5in',            alt: 'Row of nested five-inch biodegradable spoons',                              intrinsic: { w: 400, h: 300 } },
  { slug: 'vinayagar-statue-6in', imageSlug: 'products/vinayagar-statue-6in', alt: 'Six-inch Vinayagar statue seated in a bagasse bowl',                        intrinsic: { w: 400, h: 425 } },
];

function buildFeatured(spec: FeaturedSpec): Featured | null {
  const product = findProductBySlug(spec.slug);
  if (!product) return null;
  const base = `assets/${spec.imageSlug}`;
  return {
    ...product,
    imageSlug: spec.imageSlug,
    alt: spec.alt,
    intrinsic: spec.intrinsic,
    avifSrcset: `${base}-400.avif 400w, ${base}-800.avif 800w`,
    webpSrcset: `${base}-400.webp 400w, ${base}-800.webp 800w`,
    jpgSrcset:  `${base}-400.jpg 400w, ${base}-800.jpg 800w`,
    fallback:   `${base}-400.jpg`,
    priceLabel: formatINR(product.price),
  };
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    HorizontalSliderComponent,
    HorizontalSliderItemDirective,
    SectionBadgeComponent,
    MarqueeComponent,
    StatsCounterComponent,
    FaqAccordionComponent,
    RevealOnScrollDirective,
    NatureParallaxHeroComponent,
    ScrollSequenceComponent,
    MagneticDirective,
    TiltDirective,
    ParallaxImageDirective,
    MegaCtaDirective,
    KineticTextDirective,
    WordRevealDirective,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly waUrl = WA_URL;

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Rathika Biotech Products — biodegradable plates, bowls, cups, and spoons made from banana fiber, sugarcane bagasse, and rice husk. Manufactured in Neelambur, Coimbatore.',
      canonicalPath: '/',
      ogTitle: 'Rathika Biotech Products | Biodegradable Tableware, Coimbatore',
    });
  }

  protected readonly trustClaims: ReadonlyArray<string> = [
    'Made in Coimbatore',
    '100% Biodegradable',
    'Chemical-free, food-safe',
    'Bulk orders welcome',
    'Compostable in 30 days',
  ];

  protected readonly categories: ReadonlyArray<CategoryCard> = [
    { key: 'plates',   label: 'Plates',        eyebrow: 'Tableware',  imageSlug: 'products/partition-10x12',      alt: 'Partition plates stacked, embossed mark on top' },
    { key: 'bowls',    label: 'Bowls',         eyebrow: 'Tableware',  imageSlug: 'products/ice-cream-bowl-4in',   alt: 'Multi-coloured 4-inch ice cream bowls'          },
    { key: 'cups',     label: 'Cups',          eyebrow: 'Beverage',   imageSlug: 'products/tea-cup-100ml',        alt: 'Stacked 100 ml bagasse tea cups'                },
    { key: 'boxes',    label: 'Parcel boxes',  eyebrow: 'Takeaway',   imageSlug: 'products/parcel-box-300ml',     alt: 'Round 300 ml parcel box with lid'               },
    { key: 'utensils', label: 'Utensils',      eyebrow: 'Cutlery',    imageSlug: 'products/spoon-5in',            alt: 'Row of nested 5-inch spoons'                    },
    { key: 'decor',    label: 'Decor',         eyebrow: 'Ceremonial', imageSlug: 'products/vinayagar-statue-6in', alt: 'Six-inch Vinayagar statue in a bagasse bowl'    },
  ];

  protected readonly howSteps: ReadonlyArray<HowStep> = [
    {
      n: '01',
      title: 'Source from harvest waste',
      body:
        'Banana stems, sugarcane bagasse, and rice husk arrive from farms across Tamil Nadu — agricultural by-products that would otherwise be burned in the open.',
      imageSlug: 'lifestyle/story-fiber-texture',
      alt: 'Macro of natural fiber texture showing rice husk and bagasse strands',
      intrinsic: { w: 600, h: 484 },
    },
    {
      n: '02',
      title: 'Press into form',
      body:
        'Fibers are mixed with food-safe plant binder and pressed in heated moulds. No paint, no plastic film, no chemical sealer — just heat, pressure, and natural starch.',
      imageSlug: 'workshop/packing-partition-plates',
      alt: 'Open cardboard carton of partition plates fresh from production',
      intrinsic: { w: 400, h: 300 },
    },
    {
      n: '03',
      title: 'Finished, then composted',
      body:
        'The finished tableware is rigid, food-safe, and embossed with the Rathika mark. Once discarded outdoors, each piece composts cleanly within four to six weeks.',
      imageSlug: 'workshop/bowls-cluster-sunlit',
      alt: 'Cluster of finished bagasse bowls with spoons in afternoon sunlight',
      intrinsic: { w: 400, h: 300 },
    },
  ];

  protected readonly featured: ReadonlyArray<Featured> =
    FEATURED_SPECS.map(buildFeatured).filter((x): x is Featured => x !== null);

  protected readonly pillars: ReadonlyArray<Pillar> = [
    { n: '01', title: '100% Natural & Biodegradable', body: 'Made entirely from banana fiber, sugarcane bagasse, and rice husk — no plastics, no chemicals, no coatings. Decomposes safely in weeks.', icon: 'leaf' },
    { n: '02', title: 'Strong & Durable',             body: 'Natural fiber tensile strength makes these sturdy enough for hot, cold, and oily food without bending or leaking.', icon: 'shield' },
    { n: '03', title: 'Chemical-Free & Food Safe',    body: 'No synthetic binders, adhesives, or coatings. Safe for direct contact with food and ideal for eco-conscious kitchens.', icon: 'check' },
    { n: '04', title: 'Heat & Moisture Resistant',    body: 'Holds curries, gravies, and hot beverages without leaking. The natural fiber structure insulates well.', icon: 'flame' },
    { n: '05', title: 'Zero-Waste Manufacturing',     body: 'Built from agricultural by-products that would otherwise be burned. Low carbon footprint, circular economy.', icon: 'recycle' },
    { n: '06', title: 'Animal-Friendly & Compostable',body: 'Discarded outdoors, animals can safely consume it. No soil or water pollution. Returns cleanly to the earth.', icon: 'paw' },
  ];

  protected readonly whereUsed: ReadonlyArray<string> = [
    'Restaurants', 'Cafés', 'Food trucks', 'Events', 'Weddings',
    'Festivals',   'Fruit shops', 'Organic stores', 'Eco-friendly markets', 'Home',
  ];

  protected readonly faqs: ReadonlyArray<FaqItem> = [
    {
      q: 'How long does the tableware take to compost?',
      a: 'Discarded outdoors in open soil, each piece breaks down cleanly in four to six weeks. In a commercial composter the cycle is even faster — typically two to three weeks. There is no plastic film or chemical liner to slow this down.',
    },
    {
      q: 'Can I use these for hot food and liquids?',
      a: 'Yes. Plates, bowls, cups, and parcel boxes are rated for hot, oily, and saucy food at typical Indian serving temperatures. The natural fiber walls insulate the contents and resist gravy soak-through for the duration of a meal without warping.',
    },
    {
      q: 'What is the minimum order quantity?',
      a: 'The smallest bulk order is one carton — typical case quantities are 1,000 cups, 500 plates, or 300–500 boxes depending on the SKU. Bulk pricing kicks in at one carton; volume discounts apply at five cartons or more. Single-piece sample orders are not available, but we send catalogue samples on WhatsApp request.',
    },
    {
      q: 'Do you ship outside Coimbatore and Tamil Nadu?',
      a: 'Yes. We dispatch across South India by road for most orders, and pan-India for orders above a few cartons via partner logistics. Delivery time is typically 2–4 days within Tamil Nadu and 5–8 days for the rest of India. Share your delivery pincode on WhatsApp for an exact quote.',
    },
    {
      q: 'Are the products safe for children and animals?',
      a: 'Yes. The tableware contains no synthetic binders, no paint, no chemical sealers, and no plasticisers. Once discarded outdoors, animals can safely consume the fragments and the material returns to the soil without polluting it.',
    },
  ];

  protected readonly ecoTips: ReadonlyArray<EcoTip> = [
    {
      tag: 'Composting',
      title: 'How to compost biodegradable tableware at home',
      body: 'Layer used plates and cups with kitchen scraps in your compost bin. Turn weekly, keep moist, and the fibers break down in three to four weeks alongside vegetable waste.',
      date: 'Eco guide',
      imageSlug: 'lifestyle/story-fiber-texture',
      alt: 'Close-up of natural fiber texture, suggesting compostable material',
    },
    {
      tag: 'Materials',
      title: 'Why bagasse outperforms paper for hot food',
      body: 'Sugarcane bagasse fiber is denser and more heat-tolerant than recycled paper. It resists gravy soak-through for the duration of a meal where paper plates buckle within minutes.',
      date: 'Material note',
      imageSlug: 'workshop/packing-partition-plates',
      alt: 'Stack of partition plates fresh from the press',
    },
    {
      tag: 'Buying guide',
      title: 'What to look for in eco-friendly tableware',
      body: 'Check for chemical-free certification, look for embossed origin marks, and verify the supplier composts in weeks not years. We make all three easy to confirm.',
      date: 'Buyer guide',
      imageSlug: 'workshop/bowls-cluster-sunlit',
      alt: 'Cluster of finished bagasse bowls in afternoon sunlight',
    },
  ];

  /** Five stages of the manufacturing process, fed to the pinned
      scroll-sequence canvas. Maps directly to the existing workshop
      photography. Each stage's title and body is original Rathika copy. */
  protected readonly sequenceFrames: ReadonlyArray<SequenceFrame> = [
    {
      imageSlug: 'lifestyle/story-fiber-texture',
      title: 'Source the fiber',
      description: 'Banana stems, sugarcane bagasse, rice husk, and rice straw arrive from farms and mills across Tamil Nadu. By-products that would otherwise be set on fire at the field.',
      alt: 'Macro detail of natural plant fiber — rice husk and bagasse strands',
    },
    {
      imageSlug: 'workshop/nested-plates-spoons',
      title: 'Press into form',
      description: 'The fiber blend is mixed with a food-safe plant binder and pressed in heated moulds. Heat, pressure, and natural starch — no chemicals, no plastic film.',
      alt: 'Stack of partition plates with bagasse spoons fresh from the press',
    },
    {
      imageSlug: 'workshop/bowls-cluster-sunlit',
      title: 'Cure and set',
      description: 'Each piece is checked for cleanliness, rim finish, and structural integrity. Rejects go back into the binder feed for the next batch — the workshop runs a closed loop.',
      alt: 'Cluster of bagasse bowls with spoons resting in late-afternoon sun',
    },
    {
      imageSlug: 'workshop/square-box-four-spoons',
      title: 'Emboss and finish',
      description: 'Finished pieces are embossed with the Rathika mark on the base. Food-safe by virtue of being chemical-free, rigid enough for hot curries and gravies.',
      alt: 'Square parcel box with four bagasse spoons radiating outward',
    },
    {
      imageSlug: 'workshop/packing-partition-plates',
      title: 'Pack and ship',
      description: 'Pre-stacked into cartons of 500 to 2,000 pieces depending on the SKU. Handed off to a courier — most South-India deliveries land within four days. Composts in 30 days outdoors after use.',
      alt: 'Open carton stacked with finished partition plates ready to ship',
    },
  ];

  /** Agricultural by-products that get a second life as tableware.
      Four-card block beneath the trust marquee on home. */
  protected readonly agroInputs: ReadonlyArray<AgroInput> = [
    {
      icon: '🌾',
      name: 'Banana fiber',
      source: 'From the pseudo-stem cut after the banana is harvested.',
      role: 'Naturally tensile. Binds the press in our cups and bowls.',
    },
    {
      icon: '🌱',
      name: 'Sugarcane bagasse',
      source: 'The fibrous residue sugar mills are left with after extraction.',
      role: 'Light and insulating. Gives parcel boxes their structural body.',
    },
    {
      icon: '🌿',
      name: 'Rice husk',
      source: 'The protective hull separated during paddy milling.',
      role: 'Adds rigidity to plates and partition trays without going brittle.',
    },
    {
      icon: '🌾',
      name: 'Rice straw',
      source: 'Cut and gathered from the field after the paddy harvest.',
      role: 'The bulk fiber for thicker plates and ceremonial pieces.',
    },
  ];

  /** Real-world contexts where the tableware ships. Placeholder labels
      until we have named partners to swap in. */
  protected readonly trustedSegments: ReadonlyArray<TrustedSegment> = [
    { label: 'Coimbatore restaurants',         hint: 'Daily parcel + dine-in service' },
    { label: 'Tamil Nadu wedding caterers',    hint: 'Multi-thousand-piece thali events' },
    { label: 'Festival & temple committees',   hint: 'Annaprasanna, Ganesh Chaturthi, harvest pongal' },
    { label: 'Organic stores across South India', hint: 'Retail in cartons of 500–1,000' },
    { label: 'Food trucks & cafés',            hint: 'Cups + parcel boxes + rectangle boxes' },
    { label: 'Office canteens',                hint: 'Switching from disposable plastic' },
  ];

  protected readonly formatPrice = formatINR;
  protected readonly revealDelayFor = revealDelayFor;
}
