// Centralized FX and currency selection

export const allowedCurrencies = ['SYP', 'EUR', 'USD', 'SAR', 'AED', 'GBP'];

/* naive static fx (minor→minor); replace with real rates when wiring a provider */
const fxRates = {
  SYP: 500.0,
  EUR: 1.0,
  USD: 1.07,
  GBP: 0.85,
  SAR: 4.00,
  AED: 3.67,
};

export function convertMinor(amountMinor, from = 'EUR', to = 'EUR') {
  const amt = Math.max(0, Math.round(Number(amountMinor) || 0));
  const f = fxRates[from] ?? 1.0;
  const t = fxRates[to] ?? 1.0;
  if (from === to) return amt;
  // convert to base (EUR), then to target; keep integer minor units
  const inEur = amt / (f || 1);
  return Math.max(0, Math.round(inEur * (t || 1)));
}

export function defaultCurrencyForLocale(locale = 'ar') {
  const l = String(locale || '').toLowerCase();
  if (l.startsWith('ar')) return 'SYP'; // Arabic default → Syrian Pound
  if (l.startsWith('de')) return 'EUR';
  if (l.startsWith('en')) return 'USD';
  return 'EUR';
}

export function getRequestCurrency(req) {
  // explicit query param
  const q = String(req.query?.currency || '').toUpperCase();
  if (allowedCurrencies.includes(q)) return q;

  // cart currency if present
  if (req.cart?.currency && allowedCurrencies.includes(req.cart.currency)) return req.cart.currency;

  // user profile locale → currency
  const profLocale = req.user?.locale || req.user?.profile?.locale;
  if (profLocale) {
    const cur = defaultCurrencyForLocale(profLocale);
    if (allowedCurrencies.includes(cur)) return cur;
  }

  // accept-language header
  const header = String(req.headers?.['accept-language'] || '').toLowerCase();
  const tag = header.split(',')[0]?.split('-')[0];
  if (tag) {
    const cur = defaultCurrencyForLocale(tag);
    if (allowedCurrencies.includes(cur)) return cur;
  }

  return 'EUR';
}

export default { allowedCurrencies, convertMinor, defaultCurrencyForLocale, getRequestCurrency };
