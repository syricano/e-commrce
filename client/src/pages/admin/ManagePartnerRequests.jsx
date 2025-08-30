import { useMemo, useState } from 'react';
import CrudPage from './_CrudPage';
import { useLang } from '@/context/LangProvider';
import axiosInstance from '@/config/axiosConfig';

export default function ManagePartnerRequests() {
  const { t } = useLang();
  const [reload, setReload] = useState(0);
  const approve = async (id) => { await axiosInstance.post(`/partners/inquiries/${id}/approve`); setReload(x=>x+1); };
  const decline = async (id) => { await axiosInstance.post(`/partners/inquiries/${id}/decline`); setReload(x=>x+1); };
  const columns = useMemo(() => ([
    { key: 'id', label: 'ID' },
    { key: 'status', label: 'Status' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'address', label: 'Address' },
    { key: 'businessField', label: 'Business Field' },
    { key: 'shippingOptions', label: 'Shipping', render: (it) => (Array.isArray(it.shippingOptions) ? it.shippingOptions.join(', ') : '') },
    { key: 'preferredPayments', label: 'Payments', render: (it) => (Array.isArray(it.preferredPayments) ? it.preferredPayments.join(', ') : '') },
    { key: 'actions', label: 'Actions', render: (it) => (
      <div className="flex gap-2">
        <button className="btn btn-success btn-xs" onClick={()=>approve(it.id)} disabled={it.status==='approved'}>{t('Approve') || 'Approve'}</button>
        <button className="btn btn-error btn-xs" onClick={()=>decline(it.id)} disabled={it.status==='declined'}>{t('Decline') || 'Decline'}</button>
      </div>
    )},
  ]), []);
  return (
    <CrudPage
      title="Partner Requests"
      base="/partners/inquiries"
      inputSize="sm"
      reloadSignal={reload}
      columns={columns}
      showRowActions={false}
      createButtonLabel={t('Join Request') || 'Join Request'}
    />
  );
}
