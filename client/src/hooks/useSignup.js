import { useNavigate } from 'react-router';
import { useState } from 'react';
import { createUser } from '@/data';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

export default function useSignup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (payload) => {
    try {
      setLoading(true);
      await createUser(payload);
      toast.success('Account created');
      nav('/', { replace: true });
    } catch (e) {
      errorHandler(e, 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
}
