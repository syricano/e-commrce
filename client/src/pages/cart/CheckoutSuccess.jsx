import { useLocation, Link } from 'react-router-dom';
import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';
import { useAuth } from '@/context';

export default function CheckoutSuccess() {
  usePageTitle('Order placed');
  const { t } = useLang();
  const { isAuthenticated } = useAuth() || {};
  const { state } = useLocation();
  const order = state?.order || {};

  return (
    <section className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t('Thank you') || 'Thank you'}</h1>
      <div className="card bg-base-100 border"><div className="card-body space-y-2">
        <div>{t('Your order has been placed') || 'Your order has been placed'}.</div>
        {order?.number && <div>{t('Order number') || 'Order number'}: <span className="font-semibold">{order.number}</span></div>}
        <div className="opacity-80 text-sm">{t('You will receive pickup/shipping instructions shortly') || 'You will receive pickup/shipping instructions shortly'}</div>
      </div></div>

      <div className="flex gap-2">
        <Link to="/" className="btn">{t('Continue shopping') || 'Continue shopping'}</Link>
        {isAuthenticated && order?.orderId && <Link to={`/account/orders/${order.orderId}`} className="btn btn-primary">{t('View order') || 'View order'}</Link>}
      </div>
    </section>
  );
}

