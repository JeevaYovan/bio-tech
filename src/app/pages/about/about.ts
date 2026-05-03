import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export default class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly waUrl =
    'https://wa.me/919080966792?text=Hi%20Rathika%2C%20I%27d%20like%20to%20place%20an%20order.';

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'How Rathika Biotech Products turns banana fiber, sugarcane bagasse, and rice husk into biodegradable tableware at the Neelambur workshop in Coimbatore, Tamil Nadu.',
      canonicalPath: '/about/',
      ogTitle: 'Our Story — Banana Fiber Tableware from Tamil Nadu | Rathika',
    });
  }
}
