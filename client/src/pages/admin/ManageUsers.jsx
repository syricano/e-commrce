import { useEffect, useMemo, useState } from 'react';
import { adminSearchUsers, adminUpdateUserRoleStatus, adminUpdateUser, adminSuspendUser, adminDeleteUser } from '@/services';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

const ROLES = ['customer','seller','staff','admin'];
const STATUSES = ['active','suspended','pending'];

export default function Users() {
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const load = (params = {}) => {
    setLoading(true);
    adminSearchUsers({ q, role: roleFilter || undefined, status: statusFilter || undefined, ...params })
      .then((res) => setItems(res?.items || res?.data?.items || []))
      .catch((e) => errorHandler(e, 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  const onSearch = (e) => { e?.preventDefault?.(); load(); };
  const patchRow = (id, patch) => setItems((rows) => rows.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const onSave = async (u) => {
    try {
      await Promise.all([
        adminUpdateUser(u.id, { firstName: u.firstName, lastName: u.lastName, phone: u.phone }),
        adminUpdateUserRoleStatus(u.id, { role: u.role, status: u.status }),
      ]);
      toast.success('User updated');
      load();
    } catch (e) { errorHandler(e, 'Update failed'); }
  };

  const onSuspend = (u) => {
    adminSuspendUser(u.id).then(()=>toast.success('User suspended')).then(()=>load()).catch((e)=>errorHandler(e,'Suspend failed'));
  };

  const onDelete = (u) => {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    adminDeleteUser(u.id).then(()=>toast.success('User deleted')).then(()=>load()).catch((e)=>errorHandler(e,'Delete failed'));
  };

  const table = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>First</th><th>Last</th><th>Phone</th><th>Role</th><th>Status</th><th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td className="whitespace-nowrap">{u.email}</td>
              <td><input className="input input-bordered input-xs w-32" value={u.firstName || ''} onChange={(e)=>patchRow(u.id,{firstName:e.target.value})} /></td>
              <td><input className="input input-bordered input-xs w-32" value={u.lastName || ''}  onChange={(e)=>patchRow(u.id,{lastName:e.target.value})} /></td>
              <td><input className="input input-bordered input-xs w-36" value={u.phone || ''}     onChange={(e)=>patchRow(u.id,{phone:e.target.value})} /></td>
              <td>
                <select className="select select-bordered select-sm" value={u.role} onChange={(e)=>patchRow(u.id,{role:e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
              <td>
                <select className="select select-bordered select-sm" value={u.status} onChange={(e)=>patchRow(u.id,{status:e.target.value})}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="text-right space-x-2">
                <button className="btn btn-primary btn-xs" onClick={() => onSave(u)}>Save</button>
                <button className="btn btn-warning btn-xs" onClick={() => onSuspend(u)}>Suspend</button>
                <button className="btn btn-error btn-xs" onClick={() => onDelete(u)}>Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && !loading && (<tr><td colSpan={8} className="text-center opacity-60 py-6">No users</td></tr>)}
        </tbody>
      </table>
    </div>
  ), [items, loading]);

  return (
    <section className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Users</h1>
      <form onSubmit={onSearch} className="flex flex-wrap gap-2 items-end">
        <label className="form-control"><span className="label-text">Search</span>
          <input className="input input-bordered" value={q} onChange={e=>setQ(e.target.value)} placeholder="name, email, phone…" />
        </label>
        <label className="form-control"><span className="label-text">Role</span>
          <select className="select select-bordered" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
            <option value="">Any</option>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="form-control"><span className="label-text">Status</span>
          <select className="select select-bordered" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">Any</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <button className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Search'}</button>
      </form>
      {table}
    </section>
  );
}
