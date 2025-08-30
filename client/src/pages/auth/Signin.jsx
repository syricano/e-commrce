// client/src/pages/auth/Signin.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context";
import { googleLoginUrl } from "@/services";
import { toast } from "react-hot-toast";
import { useLang } from "@/context/LangProvider";

function Signin() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithCredentials } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      toast.error(t("Email and password are required") || "Email and password are required");
      return;
    }

    setLoading(true);
    const ok = await loginWithCredentials({ email, password });
    setLoading(false);

    if (!ok) return;
    const back = location.state?.from || "/";
    navigate(back, { replace: true });
  };

  return (
    <section className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('signin') || 'Sign in'}</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="form-control">
          <span className="label-text">{t('Email') || 'Email'}</span>
          <input
            name="email"
            type="email"
            className="input input-bordered"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
            required
          />
        </label>

        <label className="form-control">
          <span className="label-text">{t('Password') || 'Password'}</span>
          <input
            name="password"
            type="password"
            className="input input-bordered"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
        </label>

        <button disabled={loading} className="btn btn-primary w-full">
          {loading ? "..." : (t('signin') || 'Sign in')}
        </button>
      </form>

      <div className="divider">{t('or') || 'or'}</div>
      <a className="btn btn-outline w-full" href={googleLoginUrl()}>
        {t('Continue with Google') || 'Continue with Google'}
      </a>

      <p className="text-sm mt-3">
        {t('No account?') || 'No account?'} <Link className="link" to="/signup">{t('Create one') || 'Create one'}</Link>
      </p>
    </section>
  );
}

export default Signin;
