// client/src/pages/auth/useSignin.js
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { login } from "@/services";
import { errorHandler } from "@/utils";
import { toast } from "react-hot-toast";
import { useLang } from "@/context/LangProvider";

export default function useSignin({ onLoggedIn } = {}) {
  const { t } = useLang();
  const nav = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  const submit = (payload) => {
    setLoading(true);
    return login(payload)
      .then(({ token, user }) => {
        if (token) localStorage.setItem("token", token); // bearer for axios; cookie also set by server if used
        onLoggedIn?.({ user, token });
        toast.success(t('Signed in') || 'Signed in');
        const back = state?.from || "/";
        nav(back, { replace: true });
      })
      .catch((e) => errorHandler(e, t('Login failed') || "Login failed"))
      .finally(() => setLoading(false));
  };

  return { submit, loading };
}
