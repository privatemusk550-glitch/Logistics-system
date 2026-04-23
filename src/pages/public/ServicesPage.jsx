/**
 * ServicesPage.jsx
 * -----------------
 * Dedicated services page with detailed service listings.
 */

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useTranslation } from 'react-i18next'
import { Package, Truck, Ship, Globe, Phone, Shield, Clock, Star } from 'lucide-react'

const services = [
  {
    icon: <Package size={32} className="text-aramexRed" />,
    title: 'Parcel Delivery',
    desc: 'Fast and reliable door-to-door parcel delivery for individuals and businesses. Real-time tracking included.',
    features: ['Same-day delivery available', 'Real-time tracking', 'Proof of delivery', 'Insurance options'],
  },
  {
    icon: <Truck size={32} className="text-blue-600" />,
    title: 'Road Freight',
    desc: 'Full-truck and less-than-truck-load (LTL/FTL) road freight solutions across the region.',
    features: ['FTL & LTL options', 'Temperature-controlled', 'Hazmat handling', 'Cross-border clearance'],
  },
  {
    icon: <Ship size={32} className="text-teal-600" />,
    title: 'Sea Freight & Container Tracking',
    desc: 'Complete sea freight services including FCL, LCL, and our new real-time container tracking portal.',
    features: ['FCL & LCL', 'Port-to-port & door-to-door', 'Live container tracking', 'Customs clearance'],
    highlight: true,
  },
  {
    icon: <Globe size={32} className="text-purple-600" />,
    title: 'International Express',
    desc: 'Priority international shipping with guaranteed transit times to 220+ countries and territories.',
    features: ['220+ countries', 'Guaranteed transit', 'Online booking', 'Customs expertise'],
  },
  {
    icon: <Shield size={32} className="text-green-600" />,
    title: 'Supply Chain Solutions',
    desc: 'End-to-end supply chain management including warehousing, distribution, and reverse logistics.',
    features: ['Warehousing', 'Distribution', 'Inventory management', 'Returns handling'],
  },
  {
    icon: <Phone size={32} className="text-orange-500" />,
    title: '24/7 Customer Support',
    desc: 'Round-the-clock support from our experienced team. Reach us via chat, email, or phone anytime.',
    features: ['24/7 availability', 'Dedicated account managers', 'Live chat support', 'Multi-language support'],
  },
]

export default function ServicesPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-red-950 py-16 text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Our Services</h1>
        <p className="text-white/60 max-w-xl mx-auto">
          Comprehensive logistics solutions tailored for businesses and individuals across the globe.
        </p>
      </section>

      {/* Stats bar */}
      <div className="bg-aramexRed text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0">
          {[
            { label: 'Countries', value: '70+' },
            { label: 'Cities', value: '600+' },
            { label: 'Employees', value: '16,000+' },
            { label: 'Years Experience', value: '40+' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center py-6 border-r border-white/20 last:border-0">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-white/70 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {services.map((s) => (
          <div
            key={s.title}
            className={`bg-white rounded-2xl p-7 border shadow-sm hover:shadow-md transition-shadow
              ${s.highlight ? 'border-teal-200 ring-1 ring-teal-500/20' : 'border-gray-100'}`}
          >
            {s.highlight && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600
                               bg-teal-50 px-2.5 py-1 rounded-full mb-3">
                <Star size={11} fill="currentColor" /> New Feature
              </span>
            )}

            <div className="mb-4">{s.icon}</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>

            <ul className="space-y-1.5">
              {s.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-aramexRed flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  )
}
