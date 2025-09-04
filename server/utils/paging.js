export function parsePageLimit(input = {}, opts = {}) {
  const def = Number.isFinite(opts.def) ? opts.def : 50;
  const max = Number.isFinite(opts.max) ? opts.max : 200;
  const p = Math.max(parseInt(input.page ?? '1', 10) || 1, 1);
  const lRaw = parseInt(input.limit ?? String(def), 10);
  const l = Math.min(Math.max(lRaw || def, 1), max);
  return { page: p, limit: l, offset: (p - 1) * l };
}
export default { parsePageLimit };
