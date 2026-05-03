import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export default class ContactComponent {
  protected readonly waUrl =
    'https://wa.me/919080966792?text=Hi%20Rathika%2C%20I%27d%20like%20to%20place%20an%20order.';
  protected readonly phone = '+91 90809 66792';
  protected readonly phoneHref = 'tel:+919080966792';
  protected readonly email = 'rathikabiotechproducts@gmail.com';
  protected readonly emailHref = 'mailto:rathikabiotechproducts@gmail.com';
  protected readonly osmUrl = 'https://www.openstreetmap.org/?mlat=11.0779&mlon=77.0006#map=16/11.0779/77.0006';
  protected readonly googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Rathika+Biotech+Products+1%2F447+Avinashi+Road+Neelambur+Coimbatore';
}
