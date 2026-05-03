/**
 * Canonical product data — verbatim from PROMPT.md §11.
 * Do not invent prices, sizes, or slugs. If a SKU changes, update
 * here AND the printed brochure / catalog reference.
 */

export type ProductCategory =
  | 'bowls'
  | 'boxes'
  | 'plates'
  | 'cups'
  | 'utensils'
  | 'decor';

export interface Product {
  readonly slug: string;
  readonly name: string;
  readonly size: string;
  readonly price: number;
  readonly category: ProductCategory;
}

export const products: readonly Product[] = [
  { slug: 'ice-cream-bowl-4in',   name: 'Ice Cream Bowl',        size: '4 inch',       price: 6.0,   category: 'bowls'    },
  { slug: 'parcel-box-300ml',     name: 'Parcel Box',            size: '300 ml round', price: 11.0,  category: 'boxes'    },
  { slug: 'parcel-box-500ml',     name: 'Parcel Box',            size: '500 ml round', price: 15.0,  category: 'boxes'    },
  { slug: 'partition-10x12',     name: '10×12 Partition Plate', size: '10×12 inch',   price: 18.0,  category: 'plates'   },
  { slug: 'rectangle-box-300ml',  name: 'Rectangle Box',         size: '300 ml',       price: 12.0,  category: 'boxes'    },
  { slug: 'rectangle-box-500ml',  name: 'Rectangle Box',         size: '500 ml',       price: 16.0,  category: 'boxes'    },
  { slug: 'tea-cup-100ml',        name: 'Tea Cup',               size: '100 ml',       price: 3.5,   category: 'cups'     },
  { slug: 'straw-8in',            name: 'Straw',                 size: '8 inch',       price: 5.0,   category: 'utensils' },
  { slug: 'normal-plate',         name: 'Normal Plate',          size: 'standard',     price: 16.0,  category: 'plates'   },
  { slug: 'plate-5in',            name: 'Plate',                 size: '5 inch',       price: 9.0,   category: 'plates'   },
  { slug: 'plate-7in',            name: 'Plate',                 size: '7 inch',       price: 11.0,  category: 'plates'   },
  { slug: 'spoon-5in',            name: 'Spoon',                 size: '5 inch',       price: 2.0,   category: 'utensils' },
  { slug: 'elephant-statue-6in',  name: 'Elephant Statue',       size: '6 inch',       price: 300.0, category: 'decor'    },
  { slug: 'vinayagar-statue-6in', name: 'Vinayagar Statue',      size: '6 inch',       price: 300.0, category: 'decor'    },
] as const;

export const productCategories: readonly ProductCategory[] = [
  'bowls', 'boxes', 'plates', 'cups', 'utensils', 'decor',
] as const;

export function findProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsByCategory(category: ProductCategory): readonly Product[] {
  return products.filter((p) => p.category === category);
}

/** Format an INR price as ₹6.00 (always two decimals, no spaces). */
export function formatINR(value: number): string {
  return `₹${value.toFixed(2)}`;
}
