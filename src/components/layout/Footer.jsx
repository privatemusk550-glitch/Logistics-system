/**
 * Footer.jsx
 * ----------
 * Site footer with navigation links and social icons.
 * Now uses react-i18next for translations.
 */

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import group from '@/assets/images/group-11195.png'
import facebook from '@/assets/images/facebook.png'
import instagram from '@/assets/images/instagram.png'
import telegram from '@/assets/images/telegram.png'
import linkedin from '@/assets/images/linkedin.png'
import tiktok from '@/assets/images/tik-tok.png'

const Footer = () => {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo + tagline */}
          <div className="md:col-span-1">
            <img src={group} alt="Logo" className="h-12 mb-3" />
            <p className="text-white/50 text-sm">
              Global logistics solutions, delivered with precision.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Tracking links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Tracking
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/track" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('nav.track')}
                </Link>
              </li>
              <li>
                <Link to="/container" className="text-sm text-white/70 hover:text-white transition-colors">
                  {t('nav.container')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {[t('footer.terms'), t('footer.conditions'), t('footer.cookies')].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row
                        items-center justify-between gap-4">

          <p className="text-white/40 text-xs">
            © {year} Aramex. {t('footer.rights')}
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {[
              { src: facebook, alt: 'Facebook', href: '#' },
              { src: instagram, alt: 'Instagram', href: '#' },
              { src: telegram, alt: 'Telegram', href: '#' },
              { src: linkedin, alt: 'LinkedIn', href: '#' },
              { src: tiktok, alt: 'TikTok', href: '#' },
            ].map(({ src, alt, href }) => (
              <a
                key={alt}
                href={href}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                           flex items-center justify-center transition-colors"
                aria-label={alt}
              >
                <img src={src} alt={alt} className="h-4 w-4 object-contain" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
