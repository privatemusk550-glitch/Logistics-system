import { useState } from 'react'
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

  return (
    <div className=' overflow-hidden'>
      <Header
      />
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
