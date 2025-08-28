import usePageTitle from '@/hooks/usePageTitle'
import { useLang } from '@/context/LangProvider'

export default function Listings() {
  const { t } = useLang();
  usePageTitle('Listings');
  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold">{t('Listings')}</h1>
    </section>
  )
}
