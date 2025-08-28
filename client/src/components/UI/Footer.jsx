import { Link } from 'react-router-dom'
import { useLang } from '@/context/LangProvider'

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-10 border-t">
      <div className="max-w-screen-2xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-3">
        <div>
          <div className="font-bold text-lg">{t('brand')}</div>
          <p className="opacity-70 mt-2">{t('Free Market') || 'Free Market'}</p>
        </div>
        <div>
          <div className="font-semibold mb-2">{t('Categories')}</div>
          <ul className="space-y-1 opacity-80">
            <li><Link to="/c/electronics" className="link">{t('electronics')}</Link></li>
            <li><Link to="/c/computers" className="link">{t('computers')}</Link></li>
            <li><Link to="/c/fashion" className="link">{t('fashion')}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">{t('links') || 'Links'}</div>
          <ul className="space-y-1 opacity-80">
            <li><Link to="/about" className="link">{t('About') || 'About'}</Link></li>
            <li><Link to="/listings" className="link">{t('Listings')}</Link></li>
            <li><Link to="/account/profile" className="link">{t('profile')}</Link></li>
            <li><Link to="/partner" className="link text-primary">{t('Become a Partner') || 'Become a Partner'}</Link></li>
          </ul>
        </div>
      </div>
      <div className="text-center opacity-60 py-4 text-sm">© {new Date().getFullYear()} {t('brand')}</div>
    </footer>
  )
}
