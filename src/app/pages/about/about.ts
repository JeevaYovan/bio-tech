import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export default class AboutComponent {
  protected readonly waUrl =
    'https://wa.me/919080966792?text=Hi%20Rathika%2C%20I%27d%20like%20to%20place%20an%20order.';
}
