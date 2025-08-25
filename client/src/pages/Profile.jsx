import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import axiosInstance from '@/config/axiosConfig';
import { useAuth } from '@/context';
import { getMyProfile, updateMyProfile } from '@/services';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

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
        toast.success('Account saved');
        setAccEdit(false);
      })
      .catch((e) => errorHandler(e, 'Failed to save account'))
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
        toast.success('Profile saved');
        setMeEdit(false);
      })
      .catch((e) => errorHandler(e, 'Failed to save profile'))
      .finally(() => setMeBusy(false));
  };

  const meUserCard = useMemo(
    () => (
      <div className="card bg-base-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Account</h2>
            {!accEdit ? (
              <button className="btn btn-sm" onClick={() => setAccEdit(true)}>Edit account</button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={saveAccount} disabled={accBusy}>Save account</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setAccEdit(false)}>Done</button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Email" name="email" value={acc.email} onChange={onAccChange} readOnly />
            <label className="form-control">
              <span className="label-text">Role</span>
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
            <Field label="Status" name="status" value={acc.status} onChange={onAccChange} readOnly />
            <Field label="First name" name="firstName" value={acc.firstName} onChange={onAccChange} readOnly={!accEdit} />
            <Field label="Last name"  name="lastName"  value={acc.lastName}  onChange={onAccChange} readOnly={!accEdit} />
            <Field label="Phone"      name="phone"     value={acc.phone}     onChange={onAccChange} readOnly={!accEdit} />
          </div>

          <div className="divider my-3" />

          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Profile</h3>
            {!meEdit ? (
              <button className="btn btn-sm" onClick={() => setMeEdit(true)} disabled={meLoading}>Edit profile</button>
            ) : (
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={saveSelf} disabled={meBusy}>Save profile</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setMeEdit(false)}>Done</button>
              </div>
            )}
          </div>

          {!meLoading && (
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Display name" name="displayName" value={me?.displayName ?? ''} onChange={onSelfChange} readOnly={!meEdit} />
              <Field label="Avatar URL"   name="avatarUrl"   value={me?.avatarUrl   ?? ''} onChange={onSelfChange} readOnly={!meEdit} />
              <label className="form-control md:col-span-2">
                <span className="label-text">Bio</span>
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
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="flex gap-2 flex-wrap">
        <Link className="btn btn-outline btn-sm" to="/orders">My Orders</Link>
        <Link className="btn btn-outline btn-sm" to="/my/listings">My Listings</Link>
        <Link className="btn btn-outline btn-sm" to="/listings/new">Create Listing</Link>
      </div>

      {meUserCard}
    </section>
  );
}

export default Profile;
