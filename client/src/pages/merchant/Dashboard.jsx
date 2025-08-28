import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';

export default function MerchantDashboard() {
  const { t } = useLang();
  usePageTitle('Dashboard');
  return (
    <section className="p-4 space-y-2">
      <h1 className="text-2xl font-bold">{t('dashboard')} — {t('Stores')}</h1>
      <p className="opacity-70">This is your store dashboard. Product and listing tools coming next.</p>
    </section>
  );
}

