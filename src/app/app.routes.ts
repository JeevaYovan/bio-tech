import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home'),
    title: 'Rathika Biotech Products | Biodegradable Tableware, Coimbatore',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
