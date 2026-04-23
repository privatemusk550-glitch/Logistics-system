import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TrackForm from '@/components/tracking/TrackForm'
import TrackHero from '@/components/tracking/TrackHero'
import ServicesSection from '@/components/tracking/ServicesSection'
import TrackResultModal from '@/components/tracking/TrackResultModal'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'


export default function PublicTrack() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [pkg, setPkg] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    

    const { data, error } = await supabase
      .from('packages')
      .select(`
        id,
        admin_id,
        tracking_number,
        sender_name,
        sender_email,
        receiver_name,
        receiver_email,
        receiver_address,
        image_path,
        status,
        shipment_events (
          id,
          status,
          location,
          event_time
        )
      `)
      .eq('tracking_number', trackingNumber.trim())
      .single()

    setLoading(false)

    if (error) {
      setError('Tracking number not found')
      return
    }

    setPkg(data)
  }

  // Page-scoped Google Translate loader: inject only when PublicTrack mounts
  // and apply saved preference or browser language. Uses localStorage key
  // 'preferredLanguage_publicTrack' to avoid interfering with other pages.
  useEffect(() => {
    const addScript = document.createElement('script')
    addScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    addScript.async = true
    document.body.appendChild(addScript)

  window.googleTranslateElementInit = () => {
      try {
        new window.google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element')
      } catch (err) {
        console.warn('[PublicTrack] failed to init Google Translate widget', err)
      }
    }

    const poll = setInterval(() => {
      const select = document.querySelector('.goog-te-combo')
      if (select) {
        clearInterval(poll)
        let pref = null
        try {
          pref = localStorage.getItem('preferredLanguage_publicTrack')
          // preferredLanguage_publicTrack value read
        } catch (err) {
          console.warn('[PublicTrack] could not read preferredLanguage_publicTrack', err)
        }
        const lang = pref || (navigator.language && navigator.language.split('-')[0]) || ''
        // applying language
        if (lang) {
          select.value = lang
          select.dispatchEvent(new Event('change'))
        }
        // sync manual selector to the applied language
        try {
          const manual = document.getElementById('languageSwitcher')
          if (manual) {
            manual.value = lang || ''
          }
        } catch (err) {
          console.warn('[PublicTrack] could not sync manual selector', err)
        }
      }
    }, 300)

  return () => {
      try { clearInterval(poll) } catch (e) {}
      if (addScript && addScript.parentNode) addScript.parentNode.removeChild(addScript)
      try { delete window.googleTranslateElementInit } catch (e) {}
    }
  }, [])

  return (
    <div id="public-track-page" className=' overflow-hidden'>
  <Header />
      <TrackHero 
        trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            loading={loading}
            onSubmit={handleSearch}
            error={error}
      />

      <div className="-mt-10 relative z-20">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl py-10">

          <ServicesSection />
        </div>
      </div>
      <Footer></Footer>

      {pkg && (
        <TrackResultModal
          pkg={pkg}
          onClose={() => setPkg(null)}
        />
      )}
    </div>
  )
}


