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
          <div className="font-semibold mb-2">{t('Links') || 'Links'}</div>
          <ul className="space-y-1 opacity-80">
            <li><Link to="/about" className="link">{t('About') || 'About'}</Link></li>
            <li><Link to="/partner" className="link">{t('Become a Partner') || 'Become a Partner'}</Link></li>
            <li><Link to="/contact" className="link">{t('Contact us') || 'Contact us'}</Link></li>
            <li><Link to="/jobs" className="link">{t('Jobs') || 'Jobs'}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">{t('Legal') || 'Legal'}</div>
          <ul className="space-y-1 opacity-80">
            <li><Link to="/policy" className="link">{t('Policy') || 'Policy'}</Link></li>
            <li><Link to="/impressum" className="link">{t('Impressum') || 'Impressum'}</Link></li>
          </ul>
          <div className="mt-4">
            <div className="font-semibold mb-2">{t('Follow us') || 'Follow us'}</div>
            <div className="flex gap-3 opacity-80">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="link">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="link">Instagram</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="link">TikTok</a>
              <a href="https://snapchat.com" target="_blank" rel="noreferrer" className="link">Snapchat</a>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center opacity-60 py-4 text-sm">© {new Date().getFullYear()} {t('brand')}</div>
    </footer>
  )
}
