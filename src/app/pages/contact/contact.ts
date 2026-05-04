import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import {
  EMAIL,
  EMAIL_HREF,
  PHONE_DISPLAY,
  PHONE_HREF,
  WA_URL,
} from '../../shared/constants';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Contact Rathika Biotech Products in Neelambur, Coimbatore. WhatsApp +91 90809 66792 for biodegradable tableware orders. Phone, email, and workshop address.',
      canonicalPath: '/contact/',
      ogTitle: 'Contact Rathika Biotech Products, Neelambur, Coimbatore',
    });
  }
}
