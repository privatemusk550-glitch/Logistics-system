/**
 * About.jsx
 * ----------
 * About page with company information.
 * Updated to use the new Header and Footer (with translation support).
 */

import Header from './Header'
import Footer from './Footer'
import banner from '@/assets/images/banner.png'

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Banner hero */}
      <div className="relative h-72 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/70 z-10" />
        <img src={banner} alt="About banner" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="relative z-20 flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white">About Us</h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-14 text-gray-700 space-y-8">

        <section>
          <h2 className="text-2xl font-bold text-aramexRed mb-4">The Company</h2>
          <p className="leading-relaxed">
            Founded in 1982, Aramex has emerged as a global leader in logistics and transportation,
            renowned for its innovative services tailored to businesses and consumers. As a listed
            company on the Dubai Financial Market (since 2005) and headquartered in the UAE, our
            strategic location facilitates extensive customer reach worldwide, bridging the gap between
            East and West.
          </p>
        </section>

        <section>
          <p className="leading-relaxed">
            With operations in 600+ cities across 70 countries, Aramex employs over 16,000 professionals.
            Our success is attributed to four distinct business products that provide scalable, diversified,
            and end-to-end services:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>International Express (including Shop &amp; Ship and MyUS)</li>
            <li>Domestic Express</li>
            <li>Freight Forwarding</li>
            <li>Logistics &amp; Supply Chain Solutions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-aramexRed mb-4">Sustainability</h2>
          <p className="leading-relaxed">
            Sustainability is at the core of our vision and mission. To build a truly sustainable
            business, we leverage our core competencies to make a positive impact as responsible
            members of the communities we serve. We are aiming for Carbon-Neutrality by 2030 and
            Net-Zero emissions by 2050.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-aramexRed mb-4">Key Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'For Businesses', desc: 'Offers scalable logistics solutions; good for SMEs, e-commerce companies, and large enterprises.' },
              { title: 'For Consumers', desc: 'Reliable global delivery option; especially useful for cross-border shopping.' },
              { title: 'For Emerging Markets', desc: 'Helps facilitate trade by offering logistics infrastructure without requiring businesses to build their own.' },
              { title: 'Corporate Activism', desc: 'Involved in social projects (youth empowerment, education) and environmental initiatives.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default About
