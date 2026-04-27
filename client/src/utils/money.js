/** Stored amount matches server `price_cents`: displayed VND = value / 100 */

export function formatVndFromPriceCents(priceCents) {
  if (priceCents == null || priceCents === '') return null;
  const n = Number(priceCents);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${(n / 100).toLocaleString('vi-VN')} \u20ab`;
}

export function formatVndFromPriceCentsOrFree(priceCents, freeLabel = 'Miễn phí') {
  const s = formatVndFromPriceCents(priceCents);
  return s || freeLabel;
}

/** Integer VND from form → stored price_cents */
export function vndToPriceCents(vnd) {
  if (vnd === '' || vnd == null) return 0;
  const raw = typeof vnd === 'number' ? vnd : parseInt(String(vnd).replace(/\D/g, ''), 10);
  if (!Number.isFinite(raw) || raw < 0) return 0;
  const scaled = raw * 100;
  return Math.min(2147483647, scaled);
}

/** Stored → whole VND for input fields */
export function priceCentsToVndInput(priceCents) {
  if (priceCents == null || priceCents === '') return '';
  const n = Math.round(Number(priceCents) / 100);
  return Number.isFinite(n) ? String(n) : '';
}
