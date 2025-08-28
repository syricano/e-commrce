import usePageTitle from '@/hooks/usePageTitle'
import { useLang } from '@/context/LangProvider'

export default function About() {
  const { t } = useLang();
  usePageTitle('About');
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">{t('About') || 'About'}</h1>
      <p className="opacity-70 mt-2">{t('About page') || 'About page'}</p>
    </section>
  )
}
