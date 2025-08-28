import { useEffect } from 'react';
import { useLang } from '@/context/LangProvider';

export default function usePageTitle(key) {
  const { t } = useLang();
  useEffect(() => {
    const brand = t('brand') || 'Free Market';
    const title = key ? `${brand} — ${t(key)}` : brand;
    document.title = title;
  }, [key, t]);
}

