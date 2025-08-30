import usePageTitle from '@/hooks/usePageTitle';
import StoreNav from '@/components/merchant/StoreNav.jsx';
import { useParams } from 'react-router-dom';
import { useLang } from '@/context/LangProvider';

export default function StoreInvoices(){
  const { id } = useParams();
  usePageTitle('Store Invoices');
  const { t } = useLang();
  return (
    <section className="p-4 max-w-3xl mx-auto space-y-2">
      <h1 className="text-2xl font-bold">{t('Store')} {id} — {t('Invoices')}</h1>
      <StoreNav />
      <p className="opacity-70">{t('Invoices helper text') || 'Invoices and payments overview is available in Admin. For a monthly statement or invoice issues, use Request Help to contact admin.'}</p>
    </section>
  );
}
