// client/src/pages/auth/useSignup.js
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register as apiRegister } from "@/services";
import { errorHandler } from "@/utils";
import { toast } from "react-hot-toast";

export default function useSignup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = (payload) => {
    setLoading(true);
    return apiRegister(payload)
      .then(() => {
        toast.success("Account created");
        nav("/", { replace: true });
      })
      .catch((e) => errorHandler(e, "Signup failed"))
      .finally(() => setLoading(false));
  };

  return { submit, loading };
}
