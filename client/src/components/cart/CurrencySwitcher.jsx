import { useEffect, useState } from 'react';
import { setCartCurrency, getCurrentCart } from '@/services/api';
import { useLang } from '@/context/LangProvider';

const currencies = ['SYP', 'EUR', 'USD', 'SAR', 'AED', 'GBP']; // keep in sync with server

function CurrencySwitcher() {
  const { t } = useLang();
  const [value, setValue] = useState(
    (typeof localStorage !== 'undefined' && localStorage.getItem('cart_currency')) || 'EUR'
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // sync with server cart on first load
    (async () => {
      try {
        const res = await getCurrentCart();
        const cur = res?.cart?.currency || 'EUR';
        setValue(cur);
        try { localStorage.setItem('cart_currency', cur); } catch {}
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const onChange = async (e) => {
    const next = e.target.value;
    setValue(next);
    setBusy(true);
    try {
      await setCartCurrency(next);
      try { localStorage.setItem('cart_currency', next); } catch {}
      // let MiniCart (and others) refresh
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <label>
      <span className="sr-only">{t('Currency') || 'Currency'}</span>
      <select
        value={value}
        onChange={onChange}
        disabled={busy}
        aria-label={t('Currency') || 'Currency'}
      >
        {currencies.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </label>
  );
}

export default CurrencySwitcher;
