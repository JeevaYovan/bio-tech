import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findProductBySlug, formatINR, type Product } from '../../../data/products';

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
}

interface Pillar {
  n: string;
  title: string;
  body: string;
}

const FEATURED_SPECS: ReadonlyArray<FeaturedSpec> = [
  {
    slug: 'tea-cup-100ml',
    imageSlug: 'products/tea-cup-100ml',
    alt: 'Three biodegradable bagasse tea cups stacked on a stone surface',
    intrinsic: { w: 400, h: 534 },
  },
  {
    slug: 'parcel-box-300ml',
    imageSlug: 'products/parcel-box-300ml',
    alt: 'Round 300 ml biodegradable parcel box with lid on a desk',
    intrinsic: { w: 400, h: 300 },
  },
  {
    slug: 'partition-10x12',
    imageSlug: 'products/partition-10x12',
    alt: 'Stack of 10 by 12 inch partition plates with embossed Rathika logo',
    intrinsic: { w: 400, h: 469 },
  },
  {
    slug: 'rectangle-box-300ml',
    imageSlug: 'products/rectangle-box-300ml',
    alt: 'Rectangular biodegradable parcel box with a bagasse spoon inside',
    intrinsic: { w: 400, h: 300 },
  },
  {
    slug: 'spoon-5in',
    imageSlug: 'products/spoon-5in',
    alt: 'Row of nested five-inch biodegradable spoons',
    intrinsic: { w: 400, h: 300 },
  },
  {
    slug: 'vinayagar-statue-6in',
    imageSlug: 'products/vinayagar-statue-6in',
    alt: 'Six-inch Vinayagar statue seated in a bagasse bowl',
    intrinsic: { w: 400, h: 425 },
  },
];

function buildFeatured(spec: FeaturedSpec): Featured {
  const product = findProductBySlug(spec.slug);
  if (!product) {
    throw new Error(`Featured product slug not found in canonical data: ${spec.slug}`);
  }
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
  };
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class HomeComponent {
  protected readonly waUrl =
    'https://wa.me/919080966792?text=Hi%20Rathika%2C%20I%27d%20like%20to%20place%20an%20order.';

  protected readonly featured: ReadonlyArray<Featured> = FEATURED_SPECS.map(buildFeatured);

  protected readonly pillars: ReadonlyArray<Pillar> = [
    {
      n: '01',
      title: '100% Natural & Biodegradable',
      body: 'Made entirely from banana fiber, sugarcane bagasse, and rice husk — no plastics, no chemicals, no coatings. Decomposes safely in weeks.',
    },
    {
      n: '02',
      title: 'Strong & Durable',
      body: 'Natural fiber tensile strength makes these sturdy enough for hot, cold, and oily food without bending or leaking.',
    },
    {
      n: '03',
      title: 'Chemical-Free & Food Safe',
      body: 'No synthetic binders, adhesives, or coatings. Safe for direct contact with food and ideal for eco-conscious kitchens.',
    },
    {
      n: '04',
      title: 'Heat & Moisture Resistant',
      body: 'Holds curries, gravies, and hot beverages without leaking. The natural fiber structure insulates well.',
    },
    {
      n: '05',
      title: 'Zero-Waste Manufacturing',
      body: 'Built from agricultural by-products that would otherwise be burned. Low carbon footprint, circular economy.',
    },
    {
      n: '06',
      title: 'Animal-Friendly & Compostable',
      body: 'Discarded outdoors, animals can safely consume it. No soil or water pollution. Returns cleanly to the earth.',
    },
  ];

  protected readonly whereUsed: ReadonlyArray<string> = [
    'Restaurants',
    'Cafés',
    'Food trucks',
    'Events',
    'Weddings',
    'Festivals',
    'Fruit shops',
    'Organic stores',
    'Eco-friendly markets',
    'Home',
  ];

  protected readonly formatPrice = formatINR;
}
