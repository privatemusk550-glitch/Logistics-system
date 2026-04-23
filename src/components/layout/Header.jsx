/**
 * Header.jsx
 * -----------
 * Main navigation header for the public-facing pages.
 *
 * KEY FIX (Production Translation Bug):
 * The old code used Google Translate's external script which breaks in production
 * because the global callback (googleTranslateElementInit) doesn't fire reliably
 * on Vercel/Netlify due to CSP and timing issues.
 *
 * NEW APPROACH:
 * We use react-i18next (already in package.json) which works perfectly in
 * production — translation files are bundled with the app, no external scripts needed.
 *
 * For junior devs:
 * - useTranslation() gives us the `t()` function to look up translated strings
 * - i18n.changeLanguage('ar') switches the whole app language instantly
 * - Translation files live in /src/i18n/locales/*.json
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '@/assets/images/aramex-logo-english.webp';
import { Globe, Menu, X, ChevronDown } from 'lucide-react';

// Supported languages — add more here as needed
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Find the currently active language object, default to English
  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  // Returns true if the current page matches this path (for active link styling)
  const isActive = (path) => location.pathname === path;

  // Switches the app language and saves preference to localStorage
  function changeLanguage(code) {
    i18n.changeLanguage(code);
    localStorage.setItem('preferredLanguage', code);
    setLangOpen(false);
    // Set RTL direction for Arabic
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  }

  // Navigation links array — add new pages here
  const navLinks = [
    { label: t('nav.track'), path: '/track' },
    { label: t('nav.container'), path: '/container' },
    { label: t('nav.services'), path: '/services' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — clicking it goes to the track page (home) */}
          <Link to="/track" className="flex-shrink-0">
            <img src={logo} alt="Company Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop navigation links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${isActive(link.path)
                    ? 'text-aramexRed bg-red-50'
                    : 'text-gray-600 hover:text-aramexRed hover:bg-gray-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Language switcher + Admin login */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Language dropdown button */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600
                           hover:bg-gray-50 transition-colors"
              >
                <Globe size={16} />
                <span>{currentLang.flag} {currentLang.label}</span>
                <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language dropdown list */}
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200
                                rounded-lg shadow-lg py-1 min-w-[140px] z-50">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2
                                  hover:bg-gray-50 transition-colors
                                  ${i18n.language === lang.code ? 'text-aramexRed font-medium' : 'text-gray-700'}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin login */}
           
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-aramexRed transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.path)
                    ? 'text-aramexRed bg-red-50'
                    : 'text-gray-700 hover:text-aramexRed hover:bg-gray-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile language switcher */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 px-4 pb-2 uppercase tracking-wider">Language</p>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { changeLanguage(lang.code); setMobileOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2
                              hover:bg-gray-50 rounded-md
                              ${i18n.language === lang.code ? 'text-aramexRed font-medium' : 'text-gray-700'}`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>

            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block mt-2 px-4 py-3 bg-aramexRed text-white text-sm font-medium
                         rounded-md text-center hover:bg-red-700 transition-colors"
            >
              {t('nav.login')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
