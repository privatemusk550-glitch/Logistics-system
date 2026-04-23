/**
 * ContainerTrack.jsx
 * -------------------
 * Public page for tracking sea freight containers.
 * Designed for your friend who works in clearing and forwarding at a seaport.
 *
 * HOW IT WORKS:
 * 1. User enters a container number (e.g. MSKU1234567)
 * 2. We query the `containers` table in Supabase
 * 3. If found, we show a result modal with:
 *    - Container details (owner, type, weight, destination)
 *    - Status badge
 *    - Port event timeline
 *    - Photo gallery (images uploaded by admin)
 *
 * DATABASE TABLES NEEDED (see SUPABASE_SCHEMA.md for the full SQL):
 * - containers         : main container record
 * - container_events   : timeline events for this container
 * - container_images   : photos of the container (stored in 'container-images' bucket)
 *
 * For junior devs:
 * - This page is public — no login required to search
 * - Admins use the port admin dashboard (/port-admin) to add containers and update status
 * - Images are stored in Supabase Storage and accessed via signed URLs
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTranslation } from 'react-i18next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ContainerResultModal from '@/components/container/ContainerResultModal'
import { Search, Ship, Anchor, Package, Globe } from 'lucide-react'

export default function ContainerTrack() {
  const { t } = useTranslation()

  // State for the search input
  const [containerNumber, setContainerNumber] = useState('')

  // Container data returned from Supabase (null = no result yet)
  const [container, setContainer] = useState(null)

  // Error message to show if not found
  const [error, setError] = useState('')

  // Loading spinner state
  const [loading, setLoading] = useState(false)

  /**
   * handleSearch
   * Queries Supabase for a container by its container_number.
   * Includes related events and images in one query.
   */
  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setContainer(null)
    setLoading(true)

    // Sanitise input: uppercase and trim whitespace
    // Container numbers are always uppercase (e.g. MSKU1234567)
    const cleaned = containerNumber.trim().toUpperCase()

    const { data, error: queryError } = await supabase
      .from('containers')
      .select(`
        id,
        container_number,
        container_type,
        owner_name,
        gross_weight_kg,
        cargo_description,
        port_of_loading,
        port_of_discharge,
        eta,
        status,
        vessel_name,
        voyage_number,
        created_at,
        container_events (
          id,
          event_type,
          location,
          description,
          event_time
        ),
        container_images (
          id,
          image_path,
          caption
        )
      `)
      .eq('container_number', cleaned)
      .single()

    setLoading(false)

    if (queryError || !data) {
      setError(t('container.notFound'))
      return
    }

    setContainer(data)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
                          py-20 overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-aramexRed/10 blur-3xl pointer-events-none" />

        {/* Ship silhouette icon (decorative) */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-5 hidden lg:block">
          <Ship size={280} className="text-white" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest
                           text-blue-300 font-semibold bg-blue-500/10 px-4 py-1.5 rounded-full mb-6">
            <Anchor size={12} />
            Sea Freight Tracking
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t('container.title')}
          </h1>

          <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto">
            {t('container.subtitle')}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                placeholder={t('container.placeholder')}
                className="w-full h-14 pl-11 pr-4 rounded-xl bg-white text-gray-800
                           placeholder-gray-400 outline-none text-sm font-medium
                           focus:ring-2 focus:ring-blue-400 shadow-lg uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !containerNumber.trim()}
              className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                         rounded-xl transition-colors shadow-lg
                         disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Searching...' : t('container.button')}
            </button>
          </form>

          {/* Error */}
          {error && (
            <p className="mt-4 text-red-400 text-sm font-medium">⚠ {error}</p>
          )}

          {/* Format hint */}
          <p className="mt-4 text-white/30 text-xs">
            Format: 4 letters + 7 digits (e.g. MSKU1234567, TCKU9876543)
          </p>
        </div>
      </section>

      {/* ── Info Cards Section ── */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6 w-full">
        {[
          {
            icon: <Globe size={28} className="text-blue-600" />,
            title: 'Global Port Coverage',
            desc: 'Track containers across all major seaports worldwide including Lagos, Dubai, Rotterdam, and Shanghai.',
          },
          {
            icon: <Package size={28} className="text-green-600" />,
            title: 'Full Cargo Details',
            desc: 'View container type, gross weight, cargo description, vessel name, and voyage information.',
          },
          {
            icon: <Ship size={28} className="text-aramexRed" />,
            title: 'Photo Evidence',
            desc: 'Access timestamped photos of your container taken at the port for verification and inspection.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                       hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              {card.icon}
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </section>

      <div className="flex-1" />
      <Footer />

      {/* ── Result Modal (shown when container is found) ── */}
      {container && (
        <ContainerResultModal
          container={container}
          onClose={() => setContainer(null)}
        />
      )}
    </div>
  )
}
