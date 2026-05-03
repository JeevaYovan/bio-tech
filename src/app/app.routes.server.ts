import { RenderMode, ServerRoute } from '@angular/ssr';
import { displayableProducts } from '../data/product-content';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      displayableProducts.map((p) => ({ slug: p.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
