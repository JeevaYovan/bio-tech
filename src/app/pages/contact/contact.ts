import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import {
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  WA_URL,
} from '../../shared/constants';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { ParallaxImageDirective } from '../../shared/parallax-image/parallax-image.directive';
import { MagneticDirective } from '../../shared/magnetic/magnetic.directive';
import { TiltDirective } from '../../shared/tilt/tilt.directive';
import { NatureParallaxHeroComponent } from '../../shared/nature-parallax-hero/nature-parallax-hero';
import { KineticTextDirective } from '../../shared/kinetic-text/kinetic-text.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SectionBadgeComponent,
    RevealOnScrollDirective,
    ParallaxImageDirective,
    MagneticDirective,
    TiltDirective,
    NatureParallaxHeroComponent,
    KineticTextDirective,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export default class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly waUrl = WA_URL;
  protected readonly phone = PHONE_DISPLAY;
  protected readonly phoneHref = PHONE_HREF;
  protected readonly email = EMAIL;
  protected readonly emailHref = EMAIL_HREF;
  protected readonly osmUrl = 'https://www.openstreetmap.org/?mlat=11.0779&mlon=77.0006#map=16/11.0779/77.0006';
  protected readonly googleMapsUrl = 'https://www.google.com/maps?q=11.0779,77.0006&z=15';

  protected readonly formName = signal('');
  protected readonly formPhone = signal('');
  protected readonly formMessage = signal('');

  protected readonly canSubmit = computed(
    () => this.formName().trim().length > 1 && this.formMessage().trim().length > 4,
  );

  protected readonly waMessageUrl = computed(() => {
    const lines = [
      `Hi Rathika, I'm ${this.formName().trim() || '[name]'}.`,
      this.formPhone().trim() ? `Phone: ${this.formPhone().trim()}` : '',
      '',
      this.formMessage().trim(),
    ]
      .filter(Boolean)
      .join('\n');
    return `https://wa.me/919080966792?text=${encodeURIComponent(lines)}`;
  });

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Contact Rathika Biotech Products in Neelambur, Coimbatore. WhatsApp +91 90809 66792 for biodegradable tableware orders. Phone, email, and workshop address.',
      canonicalPath: '/contact/',
      ogTitle: 'Contact Rathika Biotech Products, Neelambur, Coimbatore',
    });
  }

  /** Open the WhatsApp deep link in a new tab. Called by the Send
   *  button — only fires when canSubmit() is true (the template guards
   *  the click). Uses window.open so the host element can be a real
   *  <button>, which gives screen readers correct disabled semantics
   *  via the native `disabled` attribute (a11y SC 4.1.2). */
  protected sendWhatsApp(): void {
    if (!this.canSubmit()) return;
    if (!isPlatformBrowser(this.platformId)) return;
    window.open(this.waMessageUrl(), '_blank', 'noopener,noreferrer');
  }

  protected onFieldInput(field: 'name' | 'phone' | 'message', value: string): void {
    if (field === 'name') this.formName.set(value);
    else if (field === 'phone') this.formPhone.set(value);
    else this.formMessage.set(value);
  }

  protected readonly revealDelayFor = revealDelayFor;
}
