export const clamp = (n, lo = -Infinity, hi = Infinity) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.min(hi, Math.max(lo, x));
};

export default { clamp };

