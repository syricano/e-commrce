import { Link, useLocation, useParams } from 'react-router-dom';
import { useLang } from '@/context/LangProvider';

export default function StoreNav() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const { t } = useLang();
  const base = `/merchant/store/${id}`;
  const items = [
    { to: `${base}/products`, label: t('Products') || 'Products' },
    { to: `${base}/offers`,   label: t('Offers')   || 'Offers'   },
    { to: `${base}/shipping`, label: t('Shipping') || 'Shipping' },
    { to: `${base}/pickup`,   label: t('Pickup')   || 'Pickup'   },
    { to: `${base}/payment`,  label: t('Payment')  || 'Payment'  },
    { to: `${base}/invoices`, label: t('Invoices') || 'Invoices' },
    { to: `${base}/assets`,   label: t('Assets')   || 'Assets'   },
    { to: `${base}/help`,     label: t('Help')     || 'Help'     },
  ];
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
      <Link to="/merchant" className="btn btn-ghost btn-xs">← {t('Back') || 'Back'}</Link>
      <div className="tabs tabs-boxed">
        {items.map(i => (
          <Link key={i.to} to={i.to} className={`tab ${pathname.startsWith(i.to) ? 'tab-active' : ''}`}>{i.label}</Link>
        ))}
      </div>
    </div>
  );
}
