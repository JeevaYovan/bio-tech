import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { WA_URL } from '../../shared/constants';
import { SectionBadgeComponent } from '../../shared/section-badge/section-badge';
import { StatsCounterComponent } from '../../shared/stats-counter/stats-counter';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-wholesale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    SectionBadgeComponent,
    StatsCounterComponent,
    RevealDirective,
  ],
  templateUrl: './wholesale.html',
  styleUrl: './wholesale.scss',
})
export default class WholesaleComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly waUrl = WA_URL;

  protected readonly form = {
    name: signal(''),
    business: signal(''),
    items: signal(''),
    qty: signal(''),
    eventDate: signal(''),
    city: signal(''),
  } as const;

  protected readonly canSubmit = computed(
    () =>
      this.form.name().trim().length > 1 &&
      this.form.business().trim().length > 1 &&
      this.form.items().trim().length > 1,
  );

  protected readonly waMessageUrl = computed(() => {
    const lines = [
      `Wholesale inquiry from ${this.form.name().trim() || '[name]'}`,
      `Business: ${this.form.business().trim() || '[business name]'}`,
      this.form.city().trim() ? `City: ${this.form.city().trim()}` : '',
      this.form.eventDate().trim() ? `Event date: ${this.form.eventDate().trim()}` : '',
      '',
      'Items + quantities:',
      this.form.items().trim() || '[product slugs and quantities]',
      this.form.qty().trim() ? `Total qty estimate: ${this.form.qty().trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    return `https://wa.me/919080966792?text=${encodeURIComponent(lines)}`;
  });

  ngOnInit(): void {
    this.seo.applyRouteSeo({
      description:
        'Bulk wholesale orders of biodegradable tableware for restaurants, caterers, weddings, and festivals. Bagasse plates, banana fiber bowls, parcel boxes from Coimbatore, Tamil Nadu.',
      canonicalPath: '/wholesale/',
      ogTitle: 'Wholesale — Bulk Biodegradable Tableware | Rathika Biotech',
    });
  }

  protected onField<K extends keyof typeof this.form>(field: K, value: string): void {
    this.form[field].set(value);
  }
}
