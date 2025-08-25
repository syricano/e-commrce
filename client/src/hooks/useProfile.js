// client/src/pages/account/useProfile.js
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/services";
import { errorHandler } from "@/utils";
import { toast } from "react-hot-toast";

export default function useProfile() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  useEffect(() => {
    let mounted = true;
    getMyProfile()
      .then((data) => { if (mounted) setForm(data || {}); })
      .catch((e) => errorHandler(e, "Failed to load profile"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const save = () =>
    updateMyProfile(form)
      .then(() => toast.success("Saved"))
      .catch((e) => errorHandler(e, "Update failed"));

  return { form, setForm, onChange, save, loading };
}
