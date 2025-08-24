import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
// Placeholder: later call a real endpoint, e.g. POST /seller-applications
// or POST /stores with status=pending.

function BecomeSeller() {
  const nav = useNavigate();
  const [form, setForm] = useState({ storeName: '', about: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // TODO: wire backend endpoint.
      // await axiosInstance.post('/seller-applications', form);
      toast.success('Application submitted');
      nav('/profile', { replace: true });
    } catch (e2) {
      toast.error('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Become a seller</h1>
      <p className="opacity-80">Tell us about your store to start the review.</p>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="form-control">
          <span className="label-text">Store name</span>
          <input
            name="storeName"
            className="input input-bordered"
            value={form.storeName}
            onChange={onChange}
            required
          />
        </label>
        <label className="form-control">
          <span className="label-text">About</span>
          <textarea
            name="about"
            className="textarea textarea-bordered"
            rows={4}
            value={form.about}
            onChange={onChange}
          />
        </label>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? '...' : 'Submit application'}
        </button>
      </form>
    </section>
  );
}

export default BecomeSeller;
