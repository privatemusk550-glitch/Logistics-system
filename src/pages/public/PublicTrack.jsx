/**
 * PublicTrack.jsx
 * ----------------
 * Main public tracking page.
 *
 * TRANSLATION FIX:
 * The old code injected Google Translate's script dynamically. This broke in
 * production because:
 * 1. The global callback `googleTranslateElementInit` wasn't always available
 * 2. CSP headers on Vercel sometimes blocked the external script
 * 3. The polling interval caused race conditions
 *
 * The new approach uses react-i18next (bundled, no external scripts).
 * Language switching now happens via the Header component.
 * This works 100% reliably in production.
 *
 * For junior devs:
 * - handleSearch queries Supabase for a package matching the tracking number
 * - If found, it sets `pkg` state which triggers the TrackResultModal to appear
 * - The modal disappears when user clicks close (onClose sets pkg to null)
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import TrackForm from '@/components/tracking/TrackForm'
import TrackHero from '@/components/tracking/TrackHero'
import ServicesSection from '@/components/tracking/ServicesSection'
import TrackResultModal from '@/components/tracking/TrackResultModal'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PublicTrack() {
  // What the user types in the search box
  const [trackingNumber, setTrackingNumber] = useState('')

  // The package returned from Supabase (null = no result)
  const [pkg, setPkg] = useState(null)

  // Error to display if not found
  const [error, setError] = useState('')

  // Shows a loading indicator while querying
  const [loading, setLoading] = useState(false)

  /**
   * handleSearch
   * Called when user submits the tracking form.
   * Queries the `packages` table and its related `shipment_events`.
   */
  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setPkg(null)
    setLoading(true)

    const { data, error: queryError } = await supabase
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

    if (queryError || !data) {
      setError('Tracking number not found. Please check and try again.')
      return
    }

    setPkg(data)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero section with search form */}
      <TrackHero
        trackingNumber={trackingNumber}
        setTrackingNumber={setTrackingNumber}
        loading={loading}
        onSubmit={handleSearch}
        error={error}
      />

      {/* Services section below the hero */}
      <div className="flex-1 bg-gray-50">
        <ServicesSection />
      </div>

      <Footer />

      {/* Result modal — only renders when a package is found */}
      {pkg && (
        <TrackResultModal
          pkg={pkg}
          onClose={() => setPkg(null)}
        />
      )}
    </div>
  )
}
