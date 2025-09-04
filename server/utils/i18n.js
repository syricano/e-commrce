export function pickTranslation(translations = [], locale = 'ar', fallbacks = ['ar','en']) {
  if (!Array.isArray(translations) || translations.length === 0) return null;
  const map = new Map();
  for (const tr of translations) map.set(tr.locale, tr);
  return map.get(locale) || fallbacks.map(f => map.get(f)).find(Boolean) || translations[0] || null;
}

export function localeFromReq(req, def = 'ar') {
  const q = String(req.query?.locale || '').trim();
  if (q) return q;
  const header = String(req.headers?.['accept-language'] || '').toLowerCase();
  const tag = header.split(',')[0]?.split('-')[0];
  if (tag) return tag;
  return def;
}

export default { pickTranslation, localeFromReq };
