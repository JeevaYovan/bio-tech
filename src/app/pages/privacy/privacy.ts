import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-privacy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export default class PrivacyComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Rathika Biotech Products privacy notice. We do not run cookies, analytics trackers, or third-party scripts on this site. Direct contact only via WhatsApp, phone, and email.',
      canonicalPath: '/privacy/',
      ogTitle: 'Privacy notice — Rathika Biotech Products',
    });
  }
}
