import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/config/axiosConfig';
import { useAuth } from '@/context';
import { getMyProfile, updateMyProfile } from '@/services';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';
import { useLang } from '@/context/LangProvider';

const ROLES = ['customer','seller','staff','admin'];

function Field({ label, name, value, onChange, type = 'text', readOnly = false }) {
  return (
    <label className="form-control">
      <span className="label-text">{label}</span>
      <input
        className="input input-bordered"
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        readOnly={readOnly}
      />
    </label>
  );
}

function Profile() {
  const { user, role } = useAuth();
  const { t } = useLang();
  const isAdmin = role === 'admin';

  /* ---------- Account (self: /users/me) ---------- */
  const [acc, setAcc] = useState({
    email: user?.email ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    role: user?.role ?? 'customer',
    status: user?.status ?? 'active',
  });
  const [accEdit, setAccEdit] = useState(false);
  const [accBusy, setAccBusy] = useState(false);

  useEffect(() => {
    setAcc({
      email: user?.email ?? '',
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
      role: user?.role ?? 'customer',
      status: user?.status ?? 'active',
    });
  }, [user]);

  const onAccChange = (e) => setAcc((s) => ({ ...s, [e.target.name]: e.target.value }));

  const saveAccount = () => {
    if (!accEdit) return;
    setAccBusy(true);
    axiosInstance
      .put('/users/me', {
        firstName: acc.firstName,
        lastName: acc.lastName,
        phone: acc.phone,
      })
      .then(() => {
        toast.success(t('Account saved') || 'Account saved');
        setAccEdit(false);
      })
      .catch((e) => errorHandler(e, t('Failed to save account') || 'Failed to save account'))
      .finally(() => setAccBusy(false));
  };

  const onChangeRole = (e) => {
    // visible but disabled here; admin role/status changes live in Admin → Users
    setAcc((s) => ({ ...s, role: e.target.value }));
  };

  /* ---------- Profile (self) ---------- */
  const [me, setMe] = useState({ displayName: '', avatarUrl: '', bio: '' });
  const [meLoading, setMeLoading] = useState(true);
  const [meEdit, setMeEdit] = useState(false);
  const [meBusy, setMeBusy] = useState(false);
  const onSelfChange = (e) => setMe((s) => ({ ...(s || {}), [e.target.name]: e.target.value }));

  useEffect(() => {
    setMeLoading(true);
    getMyProfile()
      .then((p) => setMe(p || { displayName: '', avatarUrl: '', bio: '' }))
      .catch((e) => {
        if (e?.response?.status === 404) setMe({ displayName: '', avatarUrl: '', bio: '' });
        else errorHandler(e, 'Failed to load your profile');
      })
      .finally(() => setMeLoading(false));
  }, []);

  const saveSelf = () => {
    if (!meEdit) return;
    setMeBusy(true);
    updateMyProfile(me)
      .then(() => {
        toast.success(t('Profile saved') || 'Profile saved');
        setMeEdit(false);
      })
      .catch((e) => errorHandler(e, t('Failed to save profile') || 'Failed to save profile'))
      .finally(() => setMeBusy(false));
  };

  const meUserCard = useMemo(
    () => (
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">{t('Account') || 'Account'}</h2>
            {!accEdit ? (
              <button className="btn btn-sm" onClick={() => setAccEdit(true)}>{t('Edit account') || 'Edit account'}</button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={saveAccount} disabled={accBusy}>{t('Save account') || 'Save account'}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setAccEdit(false)}>{t('Done') || 'Done'}</button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label={t('Email') || 'Email'} name="email" value={acc.email} onChange={onAccChange} readOnly />
            <label className="form-control">
              <span className="label-text">{t('Role') || 'Role'}</span>
              <select
                className="select select-bordered"
                value={acc.role}
                onChange={onChangeRole}
                disabled
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <Field label={t('Status') || 'Status'} name="status" value={acc.status} onChange={onAccChange} readOnly />
            <Field label={t('First name') || 'First name'} name="firstName" value={acc.firstName} onChange={onAccChange} readOnly={!accEdit} />
            <Field label={t('Last name') || 'Last name'}  name="lastName"  value={acc.lastName}  onChange={onAccChange} readOnly={!accEdit} />
            <Field label={t('Phone') || 'Phone'}      name="phone"     value={acc.phone}     onChange={onAccChange} readOnly={!accEdit} />
          </div>

          <div className="divider my-3" />

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t('Profile') || 'Profile'}</h3>
            {!meEdit ? (
              <button className="btn btn-sm" onClick={() => setMeEdit(true)} disabled={meLoading}>{t('Edit profile') || 'Edit profile'}</button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={saveSelf} disabled={meBusy}>{t('Save profile') || 'Save profile'}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setMeEdit(false)}>{t('Done') || 'Done'}</button>
              </div>
            )}
          </div>

          {!meLoading && (
            <div className="grid md:grid-cols-2 gap-3">
              <Field label={t('Display name') || 'Display name'} name="displayName" value={me?.displayName ?? ''} onChange={onSelfChange} readOnly={!meEdit} />
              <Field label={t('Avatar URL') || 'Avatar URL'}   name="avatarUrl"   value={me?.avatarUrl   ?? ''} onChange={onSelfChange} readOnly={!meEdit} />
              <label className="form-control md:col-span-2">
                <span className="label-text">{t('Bio') || 'Bio'}</span>
                <textarea
                  className="textarea textarea-bordered"
                  name="bio"
                  value={me?.bio ?? ''}
                  onChange={onSelfChange}
                  readOnly={!meEdit}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    ),
    [acc, accEdit, accBusy, me, meEdit, meLoading]
  );

  return (
    <section className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">{t('Profile') || 'Profile'}</h1>

      <div className="flex gap-2 flex-wrap">
        <Link className="btn btn-outline btn-sm" to="/account/orders">{t('My Orders') || 'My Orders'}</Link>
        <Link className="btn btn-outline btn-sm" to="/account/listings">{t('My Listings') || 'My Listings'}</Link>
        <Link className="btn btn-outline btn-sm" to="/account/listings/new">{t('Create Listing') || 'Create Listing'}</Link>
      </div>

      {meUserCard}
    </section>
  );
}

export default Profile;
