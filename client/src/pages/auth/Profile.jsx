// client/src/pages/account/Profile.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthProvider";
import { getMe } from "@/services";
import { errorHandler } from "@/utils";

function Profile() {
  const { user: ctxUser, role } = useAuth();
  const [user, setUser] = useState(ctxUser || null);
  const [loading, setLoading] = useState(!ctxUser);

  useEffect(() => {
    let live = true;
    if (ctxUser) { setUser(ctxUser); setLoading(false); return; }
    getMe()
      .then((me) => { if (live) setUser(me?.user ?? me ?? null); })
      .catch((e) => errorHandler(e, "Failed to load profile"))
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [ctxUser]);

  if (loading) return <div className="p-4">...</div>;
  if (!user)    return <div className="p-4">No profile</div>;

  return (
    <section className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-3">
        <div className="form-control">
          <span className="label-text">Email</span>
          <input className="input input-bordered" value={user.email || ""} readOnly />
        </div>
        <div className="form-control">
          <span className="label-text">First name</span>
          <input className="input input-bordered" value={user.firstName || ""} readOnly />
        </div>
        <div className="form-control">
          <span className="label-text">Last name</span>
          <input className="input input-bordered" value={user.lastName || ""} readOnly />
        </div>
        <div className="form-control">
          <span className="label-text">Phone</span>
          <input className="input input-bordered" value={user.phone || ""} readOnly />
        </div>
      </div>

      {role !== "seller" && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Want to become a seller?</h2>
            <p>Apply to open a store and sell your products.</p>
            <div className="card-actions">
              <Link className="btn btn-primary" to="/partner/apply">Become a seller</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Profile;
