import usePageTitle from '@/hooks/usePageTitle';
import { useLang } from '@/context/LangProvider';

export default function Messages() {
  const { t } = useLang();
  usePageTitle('Messages');
  return (
    <section className="p-4">
      <h1 className="text-xl font-semibold">{t('Messages') || 'Messages'}</h1>
      <p className="opacity-70">Coming soon.</p>
    </section>
  );
}

