// Category helpers (client-side)

import { slugify } from './strings.js';

/**
 * Resolve a category slug from translations list.
 * Falls back to name->slug when no slug provided.
 */
export const slugOf = (id, translations, preferredLocale = 'en') => {
  const list = Array.isArray(translations) ? translations : [];
  const pref =
    list.find((t) => Number(t.categoryId) === Number(id) && t.locale === preferredLocale) ||
    list.find((t) => Number(t.categoryId) === Number(id));
  return pref?.slug || (pref?.name ? slugify(pref.name) : '');
};
