// client/src/pages/auth/Signin.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router"; // no -dom
import { useAuth } from "@/context";
import { googleLoginUrl } from "@/data";
import { toast } from "react-hot-toast";

function Signin() {
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
      toast.error("Email and password are required");
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
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>

      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="form-control">
          <span className="label-text">Email</span>
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
          <span className="label-text">Password</span>
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
          {loading ? "..." : "Sign in"}
        </button>
      </form>

      <div className="divider">or</div>
      <a className="btn btn-outline w-full" href={googleLoginUrl()}>
        Continue with Google
      </a>

      <p className="text-sm mt-3">
        No account? <Link className="link" to="/signup">Create one</Link>
      </p>
    </section>
  );
}

export default Signin;
