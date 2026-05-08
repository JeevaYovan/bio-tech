import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    /* provideAnimationsAsync ships the smaller animations runtime —
       we only use it for the route-fade trigger (animation #1) so the
       eager BrowserAnimationsModule would be wasted bundle. */
    provideAnimationsAsync(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      /* Preload every lazy route chunk after the initial bundle has
         settled. The hot path (Home → Products → Why Rathika → About →
         Contact → Wholesale) must feel instant; without this, every
         first visit to a route waits on a chunk download which the
         user reads as "the app is slow". Initial JS gzip stays under
         budget because the lazy chunks still don't enter the main
         bundle — they're just fetched in idle time once Home renders. */
      withPreloading(PreloadAllModules),
    ),
    provideClientHydration(withEventReplay()),
  ],
};
