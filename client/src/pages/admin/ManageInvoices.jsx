import CrudPage from './_CrudPage';
import { useLang } from '@/context/LangProvider';

export default function ManageInvoices() {
  const { t } = useLang();
  return (
    <CrudPage
      title={t('Invoices') || 'Invoices'}
      base="/payments"
      inputSize="sm"
      columns={[
        { key: 'id', label: t('ID') || 'ID' },
        { key: 'orderId', label: t('Order') || 'Order' },
        { key: 'provider', label: t('Provider') || 'Provider' },
        { key: 'transactionId', label: t('Txn ID') || 'Txn ID' },
        { key: 'status', label: t('Status') || 'Status' },
        { key: 'amount', label: t('Amount') || 'Amount' },
        { key: 'currency', label: t('Currency') || 'Currency' },
        { key: 'capturedAt', label: t('Captured At') || 'Captured At' },
      ]}
      showRowActions={false}
    />
  );
}
