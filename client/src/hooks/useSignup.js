// client/src/pages/auth/useSignup.js
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register as apiRegister } from "@/services";
import { errorHandler } from "@/utils";
import { toast } from "react-hot-toast";
import { useLang } from "@/context/LangProvider";

export default function useSignup() {
  const { t } = useLang();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = (payload) => {
    setLoading(true);
    return apiRegister(payload)
      .then(() => {
        toast.success(t('Account created') || 'Account created');
        nav("/", { replace: true });
      })
      .catch((e) => errorHandler(e, t('Signup failed') || "Signup failed"))
      .finally(() => setLoading(false));
  };

  return { submit, loading };
}
