// client/src/pages/auth/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { register as apiRegister } from "@/services";
import { toast } from "react-hot-toast";
import { errorHandler } from "@/utils";

function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    apiRegister(form)
      .then(() => {
        toast.success("Account created");
        nav("/", { replace: true });
      })
      .catch((err) => errorHandler(err, "Signup failed"))
      .finally(() => setLoading(false));
  };

  return (
    <section className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sign up</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <label className="form-control">
          <span className="label-text">First name</span>
          <input name="firstName" className="input input-bordered" value={form.firstName} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">Last name</span>
          <input name="lastName" className="input input-bordered" value={form.lastName} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">Email</span>
          <input name="email" type="email" className="input input-bordered" value={form.email} onChange={onChange} required />
        </label>
        <label className="form-control">
          <span className="label-text">Password</span>
          <input name="password" type="password" className="input input-bordered" value={form.password} onChange={onChange} required autoComplete="new-password" />
        </label>
        <button disabled={loading} className="btn btn-primary w-full">{loading ? "..." : "Create account"}</button>
      </form>
      <p className="text-sm mt-3">Already have an account? <Link className="link" to="/signin">Sign in</Link></p>
    </section>
  );
}

export default Signup;
