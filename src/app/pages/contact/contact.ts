import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { SeoService } from '../../services/seo.service';
import {
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  WA_URL,
} from '../../shared/constants';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { RevealDirective } from '../../shared/reveal.directive';
import { RevealOnScrollDirective } from '../../shared/reveal/reveal-on-scroll.directive';
import { revealDelayFor } from '../../shared/reveal/reveal.util';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionBadgeComponent, RevealDirective, RevealOnScrollDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export default class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);

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

  protected onFieldInput(field: 'name' | 'phone' | 'message', value: string): void {
    if (field === 'name') this.formName.set(value);
    else if (field === 'phone') this.formPhone.set(value);
    else this.formMessage.set(value);
  }

  protected readonly revealDelayFor = revealDelayFor;
}
