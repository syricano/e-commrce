// client/src/utils/media.js

/**
 * Normalize relative file URLs to absolute using VITE_FILES_BASE_URL.
 * Leaves absolute http(s) URLs unchanged.
 * @param {string} url
 * @returns {string}
 */
export function normalizeImg(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_FILES_BASE_URL || '';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
