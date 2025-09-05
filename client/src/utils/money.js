export const formatMoneyMinor = (currency, minor) => {
  // Deprecated: now all amounts are major. Fallback to major behavior.
  const val = Number(minor || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  } catch {
    return `${val.toFixed(2)} ${currency || 'EUR'}`;
  }
};

export const formatMoneyMajor = (currency, major) => {
  const val = Number(major || 0);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  } catch {
    return `${val.toFixed(2)} ${currency || 'EUR'}`;
  }
};

export default { formatMoneyMinor, formatMoneyMajor };
