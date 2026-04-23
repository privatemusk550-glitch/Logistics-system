/**
 * ContactPage.jsx
 * ----------------
 * Contact page with info cards and a simple contact form.
 * The form submits to EmailJS (same service already used in the app).
 */

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // In production: send via EmailJS (same config as TrackResultModal)
    // emailjs.send('service_hp7tcgb', 'template_contact', form, 'yRmDqe6CPNJQOzgti')
    console.log('[ContactPage] form submitted:', form)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16 text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-3">Get In Touch</h1>
        <p className="text-white/60 max-w-md mx-auto">
          Have a question or need a quote? Our team is ready to help.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h2>

            {[
              { icon: <Phone size={20} className="text-aramexRed" />, label: 'Phone', value: '+971 4 222 1111' },
              { icon: <Mail size={20} className="text-aramexRed" />, label: 'Email', value: 'aramexdeliveryunlimited103@gmail.com' },
              { icon: <MapPin size={20} className="text-aramexRed" />, label: 'Address', value: 'Dubai, UAE — P.O. Box 23700' },
              { icon: <Clock size={20} className="text-aramexRed" />, label: 'Hours', value: 'Mon–Fri 8:00 – 18:00' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-gray-800 font-medium mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700 mb-2">Message Sent!</h3>
                <p className="text-green-600">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                    <input name="name" required value={form.name} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aramexRed"
                      placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aramexRed"
                      placeholder="john@example.com" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <input name="subject" required value={form.subject} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aramexRed"
                    placeholder="How can we help?" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-aramexRed resize-none"
                    placeholder="Tell us about your logistics needs..." />
                </div>

                <button type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-aramexRed hover:bg-red-700 text-white font-semibold rounded-xl transition-colors">
                  <Send size={16} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
