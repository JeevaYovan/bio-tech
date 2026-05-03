import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { findProductBySlug } from '../data/products';

const productTitle: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  const slug = route.paramMap.get('slug') ?? '';
  const p = findProductBySlug(slug);
  return p
    ? `${p.name} (${p.size}) — Rathika Biotech`
    : 'Product — Rathika Biotech';
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home'),
    title: 'Rathika Biotech Products | Biodegradable Tableware, Coimbatore',
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/catalog/catalog'),
    title: 'Eco-Friendly Plates, Cups & Bowls | Rathika Biotech Coimbatore',
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail'),
    title: productTitle,
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about'),
    title: 'Our Story — Banana Fiber Tableware from Tamil Nadu | Rathika',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact'),
    title: 'Contact Rathika Biotech Products, Neelambur, Coimbatore',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy'),
    title: 'Privacy notice — Rathika Biotech Products',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
