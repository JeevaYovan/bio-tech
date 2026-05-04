/**
 * Shared, app-wide constants. Used by every page that builds a
 * WhatsApp deep link (header CTA, hero CTA, product detail CTA, etc.)
 * — keeps the phone number and prefilled message in one place.
 */

/** Default WhatsApp deep-link with a generic prefilled message. */
export const WA_URL =
  'https://wa.me/919080966792?text=Hi%20Rathika%2C%20I%27d%20like%20to%20place%20an%20order.';

/** Phone */
export const PHONE_DISPLAY = '+91 90809 66792';
export const PHONE_HREF = 'tel:+919080966792';

/** Email */
export const EMAIL = 'rathikabiotechproducts@gmail.com';
export const EMAIL_HREF = 'mailto:rathikabiotechproducts@gmail.com';

/**
 * Build a per-product WhatsApp link with the SKU prefilled.
 * Used on /products/:slug detail pages.
 */
export function whatsappOrderUrlForProduct(name: string, size: string): string {
  const msg = `Hi Rathika, I'd like to order: ${name} (${size})`;
  return `https://wa.me/919080966792?text=${encodeURIComponent(msg)}`;
}
