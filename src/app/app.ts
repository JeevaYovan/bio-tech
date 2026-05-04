import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SeoService } from './services/seo.service';
import { WA_URL } from './shared/constants';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly waUrl = WA_URL;
  /**
   * Year for the footer copyright. Evaluated at component init —
   * for a fully prerendered site this is baked in at build time, so
   * an annual rebuild keeps it current. Acceptable for a year that
   * changes once per year vs. shipping a Date instance to the client.
   */
  protected readonly currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.seo.applyRootJsonLd();
  }
}
