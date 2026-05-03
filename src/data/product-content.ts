/**
 * Per-SKU descriptive content + image manifest for /products/:slug pages.
 *
 * Copy is hand-written, formal manufacturer voice ("We manufacture...")
 * per PROMPT.md §6. Each description is 80-150 words per §7d. Verify
 * sizes/prices/slugs against products.ts (which is the single source of
 * truth for that data, sourced verbatim from PROMPT.md §11).
 */

import type { Product } from './products';
import { findProductBySlug } from './products';

export interface ProductMedia {
  /** True when we have a real studio/lifestyle photo for this SKU. */
  readonly hasPhoto: boolean;
  /** Image asset slug under public/assets/, e.g. 'products/tea-cup-100ml'. */
  readonly imageSlug?: string;
  /** Intrinsic dimensions of the 400w image (used for width/height attrs to prevent CLS). */
  readonly intrinsic?: { readonly w: number; readonly h: number };
  /** Alt text for the image. Empty string when hasPhoto is false. */
  readonly alt: string;
}

export interface ProductContent {
  readonly description: string;
  readonly material: string;
  readonly uses: ReadonlyArray<string>;
  readonly media: ProductMedia;
}

const MEDIA: Record<string, ProductMedia> = {
  'ice-cream-bowl-4in': {
    hasPhoto: true,
    imageSlug: 'products/ice-cream-bowl-4in',
    intrinsic: { w: 400, h: 352 },
    alt: 'Six 4-inch biodegradable ice cream bowls in different natural colors arranged with spoons',
  },
  'parcel-box-300ml': {
    hasPhoto: true,
    imageSlug: 'products/parcel-box-300ml',
    intrinsic: { w: 400, h: 300 },
    alt: 'Round 300 ml biodegradable parcel box with matching lid',
  },
  'parcel-box-500ml': {
    hasPhoto: true,
    imageSlug: 'products/parcel-box-300ml',
    intrinsic: { w: 400, h: 300 },
    alt: 'Round biodegradable parcel box, same shape as the 300 ml in 500 ml capacity',
  },
  'partition-10x12': {
    hasPhoto: true,
    imageSlug: 'products/partition-10x12',
    intrinsic: { w: 400, h: 469 },
    alt: 'Stack of 10 by 12 inch partition plates with embossed Rathika logo on the top plate',
  },
  'rectangle-box-300ml': {
    hasPhoto: true,
    imageSlug: 'products/rectangle-box-300ml',
    intrinsic: { w: 400, h: 300 },
    alt: 'Rectangular biodegradable parcel box with a bagasse spoon laid diagonally inside',
  },
  'rectangle-box-500ml': {
    hasPhoto: true,
    imageSlug: 'products/rectangle-box-300ml',
    intrinsic: { w: 400, h: 300 },
    alt: 'Rectangular biodegradable parcel box, same shape as the 300 ml in 500 ml capacity',
  },
  'tea-cup-100ml': {
    hasPhoto: true,
    imageSlug: 'products/tea-cup-100ml',
    intrinsic: { w: 400, h: 534 },
    alt: 'Three 100 ml biodegradable tea cups stacked on a stone surface',
  },
  'straw-8in': {
    hasPhoto: false,
    alt: '',
  },
  'normal-plate': {
    hasPhoto: true,
    imageSlug: 'products/normal-plate',
    intrinsic: { w: 400, h: 300 },
    alt: 'Stack of biodegradable round dinner plates on a workshop table',
  },
  'plate-5in': {
    hasPhoto: false,
    alt: '',
  },
  'plate-7in': {
    hasPhoto: false,
    alt: '',
  },
  'spoon-5in': {
    hasPhoto: true,
    imageSlug: 'products/spoon-5in',
    intrinsic: { w: 400, h: 300 },
    alt: 'Row of nested 5-inch biodegradable spoons in warm side light',
  },
  'elephant-statue-6in': {
    hasPhoto: false,
    alt: '',
  },
  'vinayagar-statue-6in': {
    hasPhoto: true,
    imageSlug: 'products/vinayagar-statue-6in',
    intrinsic: { w: 400, h: 425 },
    alt: 'Six-inch Vinayagar statue seated in a bagasse bowl, top-down composition',
  },
};

const COPY: Record<string, Pick<ProductContent, 'description' | 'material' | 'uses'>> = {
  'ice-cream-bowl-4in': {
    description:
      'We manufacture our 4-inch ice cream bowls from sugarcane bagasse pressed with food-grade plant binder. The bowl is wide enough for two scoops and rigid enough to hold its shape against melted dairy and sticky toppings. Walls are thick at the base for stability and taper toward the rim, which gives a clean lift when the bowl is held by the side. Suitable for kulfi, frozen yoghurt, scooped fruit, and dessert service at events. Each bowl biodegrades in roughly four to six weeks once discarded outdoors. Bulk pricing available on WhatsApp; the typical case quantity is 1,000 bowls per carton.',
    material: 'Sugarcane bagasse with rice husk binder',
    uses: ['Ice cream parlours', 'Dessert counters', 'Wedding desserts', 'Kulfi vendors'],
  },
  'parcel-box-300ml': {
    description:
      'A round 300 ml parcel box with a fitted bagasse lid, designed for small portions of curry, biriyani, and gravy items. The walls are heat-resistant up to typical serving temperatures and the lid presses on with a soft snap that survives short-distance delivery without tape. The interior surface is smooth-finished so chutneys and gravies wipe clean if the box is repurposed at home. We mould the body and lid from the same banana-fiber and sugarcane mix so they decompose together. Order in cases for restaurant or catering use; minimum order is one carton.',
    material: 'Banana fiber + sugarcane bagasse',
    uses: ['Restaurants', 'Cafés', 'Catering parcels', 'Food trucks'],
  },
  'parcel-box-500ml': {
    description:
      'The 500 ml round parcel box has the same fitted-lid construction as the 300 ml, scaled for full meals — a typical rice-curry-side combo fits comfortably with room for the lid to press on cleanly. We use this size most for restaurant biriyani parcels, festival meals, and event takeaway. Walls insulate hot food without softening, and the lip flares slightly so the lid centres easily even when stacked at high volume. Like the rest of our parcel range, body and lid are moulded from the same banana fiber and sugarcane bagasse blend so they compost together within a few weeks.',
    material: 'Banana fiber + sugarcane bagasse',
    uses: ['Restaurants', 'Catering parcels', 'Wedding takeaway', 'Food trucks'],
  },
  'partition-10x12': {
    description:
      'Our 10 × 12 inch partition plate is a single moulded tray with three shaped compartments — typically rice in the largest section and curries or sides in the others. Each compartment is deep enough to hold gravy without spillage between cells. We press these plates from a slightly thicker bagasse-rice-husk mix because partition plates carry more weight per unit area than flat plates. The plate carries an embossed Rathika mark on one side. Designed for thali service at weddings, festivals, and large events; cases of 100 ship pre-stacked. Each plate is rated for one full serving of hot, oily, or saucy food.',
    material: 'Sugarcane bagasse + rice husk',
    uses: ['Wedding catering', 'Festival meals', 'Thali service', 'Community events'],
  },
  'rectangle-box-300ml': {
    description:
      'A rectangular 300 ml parcel box with a removable lid, sized for snacks, sandwiches, and single-portion sides. The flat profile stacks tightly in transit boxes and the corners are deliberately rounded so the box clears tight delivery bags without snagging. We make these from the same banana fiber and bagasse blend as the round parcel boxes; the rectangular shape is easier to portion with rectangular sides like wraps and rolls. Suitable for cold or warm food up to typical serving temperatures. Bulk orders available on WhatsApp; standard carton is 500 boxes with matching lids included.',
    material: 'Banana fiber + sugarcane bagasse',
    uses: ['Cafés', 'Sandwich shops', 'Bakeries', 'Office canteens'],
  },
  'rectangle-box-500ml': {
    description:
      'The rectangular 500 ml box scales the 300 ml format up for full meals — typically a main and one or two sides side-by-side. The taller wall keeps gravies contained without compromising the flat-stack profile that makes the rectangle range easy to transport. Same banana fiber and sugarcane bagasse moulding as the rest of the parcel range, with the lid pressing on flush. We supply these to restaurants, catering kitchens, and event teams who need biodegradable replacements for thermocol or plastic containers in higher-volume formats. Standard carton is 300 boxes with matching lids.',
    material: 'Banana fiber + sugarcane bagasse',
    uses: ['Restaurants', 'Office lunches', 'Catering parcels', 'Event takeaway'],
  },
  'tea-cup-100ml': {
    description:
      'We manufacture our 100 ml tea cups from sugarcane bagasse pressed with food-grade banana fiber. The walls are thick enough to insulate hot chai without making the cup uncomfortable to hold, and the rim flares slightly outward — comfortable on the lip and easy to stack for transit. Discarded outdoors, the cup biodegrades within four to six weeks. Suitable for tea, coffee, hot soup, and cold beverages alike. Bulk pricing available on WhatsApp; minimum order quantity is one carton (typically 1,000 cups). Each cup carries a subtle Rathika emboss on the base.',
    material: 'Sugarcane bagasse + banana fiber',
    uses: ['Tea stalls', 'Cafés', 'Office pantries', 'Events'],
  },
  'straw-8in': {
    description:
      'Our 8-inch drinking straws are extruded from natural plant fiber and rolled with a food-safe edge. The bore is wide enough for thick beverages — sugarcane juice, smoothies, and milkshakes — without collapsing, and the wall is rigid enough to last the typical 30 to 60 minutes of a single drink before any softening begins. Each straw biodegrades in soil within three to four weeks. We supply juice bars, smoothie counters, and event caterers transitioning away from plastic straws. Cases ship 1,000 straws per carton; bulk discounts apply at five cartons or more.',
    material: 'Natural plant fiber',
    uses: ['Juice bars', 'Smoothie counters', 'Event bars', 'Cafés'],
  },
  'normal-plate': {
    description:
      'Our standard plate is the everyday workhorse — round, flat, and sized for a typical meal of rice, two curries, and a side. We press these from a sugarcane bagasse and rice husk mix that resists gravy soak-through for the duration of a meal without softening or warping. The slight upturn at the rim contains liquid sides without preventing easy fork or spoon access. Used by restaurants, mess halls, and home kitchens looking for a biodegradable replacement for melamine or plastic. Cartons of 500 plates ship pre-stacked; mixed-size orders welcome on WhatsApp.',
    material: 'Sugarcane bagasse + rice husk',
    uses: ['Restaurants', 'Mess halls', 'Home use', 'Catering'],
  },
  'plate-5in': {
    description:
      'The 5-inch plate is our smallest flat plate, sized for snacks, side dishes, dessert portions, and party servings. We press it from the same bagasse-husk blend as our larger plates, scaled down — same rim profile, same gravy-resistance, lighter overall weight. Stacks compactly for storage and transit. Used heavily by sweet shops, festival vendors, and event caterers for portioned dessert service. Each plate biodegrades in three to five weeks depending on soil conditions. Standard carton is 1,000 plates; minimum order is one carton with bulk discounts at five cartons or more.',
    material: 'Sugarcane bagasse + rice husk',
    uses: ['Sweet shops', 'Festival vendors', 'Dessert service', 'Party catering'],
  },
  'plate-7in': {
    description:
      'A medium 7-inch plate sits between the 5-inch snack plate and the standard dinner plate — sized for single portions of rice with one curry, breakfast servings of idli or dosa, or substantial appetizers. We press it from the same sugarcane bagasse and rice husk mix used across our plate range, with the same gravy-resistant finish and slight rim upturn. Often ordered alongside our 5-inch plates by caterers who need two complementary sizes for staged service. Cartons of 500 plates ship pre-stacked. Available with custom embossing on bulk orders above 5,000 units.',
    material: 'Sugarcane bagasse + rice husk',
    uses: ['Restaurants', 'Breakfast service', 'Caterers', 'Mess halls'],
  },
  'spoon-5in': {
    description:
      'Our 5-inch spoons are moulded from a denser bagasse-fiber mix than our plates and bowls because cutlery is asked to flex without breaking. The bowl of the spoon is shaped to scoop curries and rice without leaving residue, and the handle has a slight inward curve that sits comfortably between thumb and forefinger. Rigid enough for hot food up to typical serving temperatures, soft enough on teeth to feel familiar. Each spoon biodegrades in four to six weeks once discarded. Cases ship 2,000 spoons per carton; we recommend ordering with matching plates and bowls for delivery efficiency.',
    material: 'Compressed bagasse + plant fiber',
    uses: ['Restaurants', 'Catering', 'Parcels', 'Events'],
  },
  'elephant-statue-6in': {
    description:
      'A 6-inch decorative elephant statue moulded from compressed sugarcane bagasse and natural binder. The form is hand-finished and the surface carries the natural fiber grain — no paint, no chemical sealer. Used as festival decor, gift shop pieces, and eco-friendly alternatives to plaster or plastic statuary. Holds detail well for display and biodegrades cleanly when discarded outdoors. We hand-finish each piece individually so minor variation in tone and texture is expected and intentional. Order in pairs or sets; available on WhatsApp with custom embossing on the base for orders above 50 units.',
    material: 'Compressed bagasse + natural binder',
    uses: ['Festival decor', 'Eco gift shops', 'Wedding decoration', 'Pooja accessories'],
  },
  'vinayagar-statue-6in': {
    description:
      'Our 6-inch Vinayagar (Ganesha) statue is moulded from compressed sugarcane bagasse and a natural binder, hand-finished with traditional features intact — the trunk curl, the seated posture, the four-armed silhouette. No paint or chemical coating; the surface carries the fiber grain naturally. Built especially for Ganesh Chaturthi where eco-friendly visarjan matters: the statue dissolves cleanly in water within hours and biodegrades in soil within weeks, with no plaster of Paris or polymer residue. Each piece is hand-finished so minor variation in tone and form is expected. Available on WhatsApp; bulk orders for temple committees welcome.',
    material: 'Compressed bagasse + natural binder',
    uses: ['Ganesh Chaturthi', 'Pooja decor', 'Temple supplies', 'Eco-friendly visarjan'],
  },
};

export interface ProductView extends Product {
  readonly content: ProductContent;
}

export function getProductView(slug: string): ProductView | undefined {
  const product = findProductBySlug(slug);
  if (!product) return undefined;
  const media = MEDIA[slug];
  const copy = COPY[slug];
  if (!media || !copy) {
    throw new Error(`Missing content for product slug: ${slug}`);
  }
  return {
    ...product,
    content: { ...copy, media },
  };
}

export function getMedia(slug: string): ProductMedia | undefined {
  return MEDIA[slug];
}
