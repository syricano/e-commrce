// client/src/pages/admin/ManageStores.jsx
import { useMemo, useState } from 'react';
import CrudPage from './_CrudPage';
import { createCrud } from '@/services';
import { useLang } from '@/context/LangProvider';

export default function Stores() {
  const { t } = useLang();
  const api = useMemo(() => createCrud('/stores'), []);
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const [f, setF] = useState({
    ownerUserId: '', name: '', slug: '', email: '', phone: '', country: '', city: '', address: '', status: 'pending', invoiceEmail: '', autoInvoice: false,
  });
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setF(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };
  const create = async () => {
    if (!f.ownerUserId || !f.name) { alert(t('Owner and Name are required') || 'Owner and Name are required'); return; }
    const payload = { ...f };
    for (const k of ['name','slug','email','phone','country','city','address','invoiceEmail']) if (typeof payload[k] === 'string') payload[k] = payload[k].trim();
    await api.create(payload);
    setOpen(false);
    setF({ ownerUserId:'', name:'', slug:'', email:'', phone:'', country:'', city:'', address:'', status:'pending', invoiceEmail:'', autoInvoice:false });
    setReload(x=>x+1);
  };

  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('Stores')}</h1>
        <button className="btn btn-primary" onClick={()=>setOpen(true)}>{t('New Store') || 'New Store'}</button>
      </div>

      <CrudPage
        title={t('Stores') || 'Stores'}
        base="/stores"
        hideCreate={true}
        inputSize="sm"
        reloadSignal={reload}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'ownerUserId', label: 'Owner' , editable: true },
          { key: 'name', label: 'Name', editable: true },
          { key: 'slug', label: 'Slug', editable: true },
          { key: 'email', label: 'Email', editable: true },
          { key: 'phone', label: 'Phone', editable: true },
          { key: 'country', label: 'Country', editable: true },
          { key: 'city', label: 'City', editable: true },
          { key: 'address', label: 'Address', editable: true },
          { key: 'status', label: 'Status', type: 'select', options: ['pending','active','suspended'], editable: true },
          { key: 'invoiceEmail', label: 'Invoice Email', editable: true },
          { key: 'autoInvoice', label: 'Auto Invoice', type: 'bool', editable: true },
        ]}
      />

      {open && (
        <dialog open className="modal">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">{t('Create Store') || 'Create Store'}</h3>
            <p className="text-xs opacity-70 mb-3">{t('Store creation help') || 'Set Status to "active" when the store is ready to go live. Leave Slug empty to auto-generate it from the Name.'}</p>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="form-control">
                <span className="label-text">{t('Owner User ID') || 'Owner User ID'}</span>
                <input className="input input-bordered" name="ownerUserId" value={f.ownerUserId} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Name') || 'Name'}</span>
                <input className="input input-bordered" name="name" value={f.name} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Slug') || 'Slug'}</span>
                <input className="input input-bordered" name="slug" value={f.slug} onChange={onChange} placeholder={t('auto from Name if empty') || 'auto from Name if empty'} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Email') || 'Email'}</span>
                <input className="input input-bordered" name="email" value={f.email} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Phone') || 'Phone'}</span>
                <input className="input input-bordered" name="phone" value={f.phone} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Country') || 'Country'}</span>
                <input className="input input-bordered" name="country" value={f.country} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('City') || 'City'}</span>
                <input className="input input-bordered" name="city" value={f.city} onChange={onChange} />
              </label>
              <label className="form-control md:col-span-2">
                <span className="label-text">{t('Address') || 'Address'}</span>
                <input className="input input-bordered" name="address" value={f.address} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Status') || 'Status'}</span>
                <select className="select select-bordered" name="status" value={f.status} onChange={onChange}>
                  {['pending','active','suspended'].map(s=> <option key={s} value={s}>{t(s) || s}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text">{t('Invoice Email') || 'Invoice Email'}</span>
                <input className="input input-bordered" name="invoiceEmail" value={f.invoiceEmail} onChange={onChange} />
              </label>
              <label className="form-control">
                <span className="label-text">{t('Auto Invoice') || 'Auto Invoice'}</span>
                <input type="checkbox" className="toggle" name="autoInvoice" checked={f.autoInvoice} onChange={onChange} />
              </label>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={()=>setOpen(false)}>{t('cancel')}</button>
              <button className="btn btn-primary" onClick={create}>{t('create')}</button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
