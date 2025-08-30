// client/src/pages/auth/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from "@/services";
import { toast } from "react-hot-toast";
import { errorHandler } from "@/utils";
import { useLang } from "@/context/LangProvider";

function Signup() {
  const { t } = useLang();
  const nav = useNavigate();
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiRegister(form)
      .then(() => {
        toast.success(t("Account created") || "Account created");
        nav("/", { replace: true });
      })
      .catch((err) => errorHandler(err, t("Signup failed") || "Signup failed"))
      .finally(() => setLoading(false));
  };

  return (
    <section className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('signup') || 'Sign up'}</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="form-control">
          <span className="label-text">{t('First name') || 'First name'}</span>
          <input name="firstName" className="input input-bordered" value={form.firstName} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Last name') || 'Last name'}</span>
          <input name="lastName" className="input input-bordered" value={form.lastName} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Email') || 'Email'}</span>
          <input name="email" type="email" className="input input-bordered" value={form.email} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">{t('Password') || 'Password'}</span>
          <input name="password" type="password" className="input input-bordered" value={form.password} onChange={onChange} required autoComplete="new-password" />
        </label>
        <button disabled={loading} className="btn btn-primary w-full">{loading ? "..." : (t('Create account') || 'Create account')}</button>
      </form>
      <p className="text-sm mt-3">{t('Already have an account?') || 'Already have an account?'} <Link className="link" to="/signin">{t('signin') || 'Sign in'}</Link></p>
    </section>
  );
}

export default Signup;
