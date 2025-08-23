import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context';
import { googleLoginUrl } from '@/data';
import useSignin from '@/hooks/useSignin';

function Signin() {
  const { loginWithCredentials } = useAuth();
  const { submit, loading } = useSignin({ onLoggedIn: loginWithCredentials });
  const [form, setForm] = useState({ email: '', password: '' });
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  return (
    <section className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={(e)=>{e.preventDefault(); submit(form);}} className="space-y-3">
        <label className="form-control">
          <span className="label-text">Email</span>
          <input name="email" type="email" className="input input-bordered" value={form.email} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">Password</span>
          <input name="password" type="password" className="input input-bordered" value={form.password} onChange={onChange} required />
        </label>
        <button disabled={loading} className="btn btn-primary w-full">{loading ? '...' : 'Sign in'}</button>
      </form>

      <div className="divider">or</div>
      <a className="btn btn-outline w-full" href={googleLoginUrl()}>Continue with Google</a>

      <p className="text-sm mt-3">
        No account? <Link className="link" to="/signup">Sign up</Link>
      </p>
    </section>
  );
}

export default Signin;
