/**
 * ServicesSection.jsx
 * --------------------
 * Displays the "Our Services" cards and the company value propositions.
 * Now uses react-i18next so text is translatable.
 *
 * For junior devs:
 * - t('services.title') looks up the 'title' key inside the 'services' object
 *   in /src/i18n/locales/en.json (or whichever language is active)
 * - The services array is built inside the component so t() is available
 */

import { useTranslation } from 'react-i18next'
import delivery from '@/assets/images/delivery.png'
import calculator from '@/assets/images/calculator.png'
import headset from '@/assets/images/headset.png'
import bitmap from '@/assets/images/bitmap.webp'
import packgeImg from '@/assets/images/img-why@2x.webp'
import headerImg from '@/assets/images/img-header.webp'
import { Link } from 'react-router-dom'

export default function ServicesSection() {
  const { t } = useTranslation()

  // Services cards data — using t() for translated labels
  const services = [
    {
      title: t('services.send'),
      desc: t('services.sendDesc'),
      img: delivery,
    },
    {
      title: t('services.quote'),
      desc: t('services.quoteDesc'),
      img: calculator,
    },
    {
      title: t('services.support'),
      desc: t('services.supportDesc'),
      img: headset,
    },
  ]

  // Company values/goals — shown below services cards
  const values = [
    {
      title: t('services.sustainable'),
      desc: t('services.sustainableDesc'),
      img: bitmap,
    },
    {
      title: t('services.flexible'),
      desc: t('services.flexibleDesc'),
      img: packgeImg,
    },
    {
      title: t('services.resilient'),
      desc: t('services.resilientDesc'),
      img: headerImg,
    },
  ]

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">

      {/* ── Services Cards ── */}
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12 text-gray-800">
        {t('services.title')}
      </h2>

      <div className="grid gap-6 md:grid-cols-3 mb-20">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow
                       duration-300 p-8 text-center border border-gray-100 group"
          >
            <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center
                            rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
              <img src={service.img} alt={service.title} className="h-9 w-9 object-contain" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">{service.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Container Tracking CTA Banner ── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 md:p-10
                      text-white text-center mb-20 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-aramexRed/20 blur-2xl" />

        <div className="relative z-10">
          <span className="text-xs uppercase tracking-widest text-aramexRed font-semibold bg-red-500/10
                           px-3 py-1 rounded-full mb-4 inline-block">
            New Feature
          </span>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Sea Freight Container Tracking
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Track your sea freight containers in real-time. Enter any container number to
            get full status, location history, and photos.
          </p>
          <Link
            to="/container"
            className="inline-block px-8 py-3.5 bg-aramexRed hover:bg-red-700 text-white
                       font-semibold rounded-xl transition-colors shadow-lg"
          >
            Track a Container →
          </Link>
        </div>
      </div>

      {/* ── Company Values ── */}
      <div className="grid gap-10 md:grid-cols-3">
        {values.map((val) => (
          <div key={val.title} className="text-center">
            <img
              src={val.img}
              alt={val.title}
              className="w-24 h-24 object-cover rounded-full mx-auto mb-4
                         ring-4 ring-red-100 shadow-md"
            />
            <h4 className="font-semibold text-gray-800 mb-2">{val.title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed">{val.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
