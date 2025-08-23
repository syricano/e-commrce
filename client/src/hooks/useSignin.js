import { useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import { login } from '@/data';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

export default function useSignin({ onLoggedIn } = {}) {
  const nav = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  const submit = async (payload) => {
    try {
      setLoading(true);
      const { token, user } = await login(payload);
      if (token) localStorage.setItem('token', token); // cookie also set by server
      onLoggedIn?.({ user, token });
      toast.success('Signed in');
      const back = state?.from || '/';
      nav(back, { replace: true });
    } catch (e) {
      errorHandler(e, 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}
