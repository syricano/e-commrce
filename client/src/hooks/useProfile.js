import { useEffect, useState } from 'react';
import { getProfileById, updateProfile } from '@/data';
import { errorHandler } from '@/utils';
import { toast } from 'react-hot-toast';

export default function useProfile(userId) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const data = await getProfileById(userId);
        if (mounted) setForm(data || {});
      } catch (e) {
        errorHandler(e, 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [userId]);

  const save = async () => {
    try {
      await updateProfile(form?.id || userId, form);
      toast.success('Saved');
    } catch (e) {
      errorHandler(e, 'Update failed');
    }
  };

  return { form, setForm, onChange, save, loading };
}
