/**
 * ContainerResultModal.jsx
 * -------------------------
 * Modal shown after a successful container search.
 * Designed for port clearing & forwarding use.
 *
 * FEATURES:
 * - Container metadata (number, type, vessel, ports)
 * - Status badge with colour coding
 * - Port event timeline (when it arrived, cleared customs, etc.)
 * - Gallery image viewer with lightbox (same pattern as TrackResultModal)
 * - ETA display
 *
 * For junior devs:
 * - Signed URLs expire in 60 seconds — this is fine for viewing but
 *   don't store them in state for longer than the modal is open
 * - The `container_images` relation comes from the Supabase query in ContainerTrack.jsx
 *   (the image_path field is the filename in the 'container-images' storage bucket)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Ship, MapPin, Package, Clock, Anchor } from 'lucide-react'

export default function ContainerResultModal({ container, onClose }) {

  // Signed URLs for container photos
  const [images, setImages] = useState([])

  // Index of the open lightbox image (null = lightbox closed)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  // ── Fetch signed URLs for all container images ─────────────────────────
  useEffect(() => {
    if (!container?.container_images?.length) return

    async function loadImages() {
      const signed = []

      for (let img of container.container_images) {
        const { data } = await supabase.storage
          .from('container-images') // This bucket must exist in your Supabase project
          .createSignedUrl(img.image_path, 60) // 60 second URL

        if (data?.signedUrl) {
          // Attach the original caption from the database
          signed.push({ url: data.signedUrl, caption: img.caption || '' })
        }
      }

      setImages(signed)
    }

    loadImages()
  }, [container])

  // ── Keyboard navigation for lightbox ──────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (selectedImageIndex === null) return

    if (e.key === 'Escape') setSelectedImageIndex(null)
    else if (e.key === 'ArrowRight') setSelectedImageIndex((p) => (p + 1) % images.length)
    else if (e.key === 'ArrowLeft') setSelectedImageIndex((p) => (p - 1 + images.length) % images.length)
  }, [selectedImageIndex, images.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // ── Status colour helper ───────────────────────────────────────────────
  function getStatusStyle(status) {
    const s = status?.toLowerCase() || ''
    if (s.includes('cleared') || s.includes('delivered') || s.includes('released'))
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    if (s.includes('hold') || s.includes('detained') || s.includes('pending'))
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    if (s.includes('transit') || s.includes('vessel') || s.includes('arrived'))
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    return 'bg-white/10 text-white border-white/20'
  }

  // Format ETA nicely
  function formatEta(eta) {
    if (!eta) return 'TBD'
    return new Date(eta).toLocaleDateString('en-GB', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  return (
    <>
      {/* ── Main Modal ── */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60
                      backdrop-blur-sm p-4">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto
                        bg-gradient-to-br from-slate-800 to-slate-900
                        border border-white/10 shadow-2xl rounded-2xl">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10
                       hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-6 md:p-8 space-y-6 text-white">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-white/10">
              <div className="flex-1">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Container Number</p>
                <h2 className="text-2xl font-bold tracking-widest font-mono">
                  {container.container_number}
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  {container.vessel_name && `Vessel: ${container.vessel_name}`}
                  {container.voyage_number && ` · Voyage ${container.voyage_number}`}
                </p>
              </div>

              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
                               font-medium border ${getStatusStyle(container.status)} flex-shrink-0`}>
                <Anchor size={13} />
                {container.status}
              </span>
            </div>

            {/* ── Container Details Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailCard label="Container Type" value={container.container_type} icon={<Package size={14} />} />
              <DetailCard label="Gross Weight" value={container.gross_weight_kg ? `${container.gross_weight_kg.toLocaleString()} kg` : '—'} />
              <DetailCard label="ETA" value={formatEta(container.eta)} icon={<Clock size={14} />} />
              <DetailCard
                label="Port of Loading"
                value={container.port_of_loading}
                icon={<MapPin size={14} />}
              />
              <DetailCard
                label="Port of Discharge"
                value={container.port_of_discharge}
                icon={<Ship size={14} />}
              />
              {container.owner_name && (
                <DetailCard label="Owner / Client" value={container.owner_name} />
              )}
            </div>

            {/* ── Cargo Description ── */}
            {container.cargo_description && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Cargo Description</p>
                <p className="text-sm text-white/80 leading-relaxed">{container.cargo_description}</p>
              </div>
            )}

            {/* ── Port Event Timeline ── */}
            {container.container_events?.length > 0 && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={16} className="text-white/60" />
                  <h3 className="font-semibold">Port Event History</h3>
                </div>

                <div className="space-y-4">
                  {container.container_events
                    .sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
                    .map((event, index, arr) => (
                      <div key={event.id} className="flex gap-4">

                        {/* Timeline dot */}
                        <div className="flex flex-col items-center flex-shrink-0 mt-1">
                          <div className={`w-3 h-3 rounded-full border-2
                            ${index === 0 ? 'bg-blue-400 border-blue-400' : 'bg-transparent border-white/40'}`}
                          />
                          {index < arr.length - 1 && (
                            <div className="flex-1 w-px bg-white/20 my-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>

                        {/* Event content */}
                        <div className="pb-4">
                          <p className="font-medium text-sm">{event.event_type}</p>
                          {event.description && (
                            <p className="text-xs text-white/60 mt-0.5">{event.description}</p>
                          )}
                          <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                            <MapPin size={10} /> {event.location}
                          </p>
                          <p className="text-xs text-white/30 mt-0.5">
                            {new Date(event.event_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── Image Gallery ── */}
            {images.length > 0 && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="font-semibold mb-4">Container Photos ({images.length})</h3>

                {/* Thumbnail grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className="relative group rounded-lg overflow-hidden border border-white/10
                                 hover:border-white/40 transition-all duration-200 aspect-square"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || `Container photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                      transition-opacity flex items-center justify-center">
                        <ZoomIn size={24} className="text-white" />
                      </div>

                      {/* Caption (if exists) */}
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white
                                        text-xs p-1.5 truncate">
                          {img.caption}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {selectedImageIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex].url}
              alt={images[selectedImageIndex].caption || `Photo ${selectedImageIndex + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            {/* Caption in lightbox */}
            {images[selectedImageIndex].caption && (
              <p className="text-white/70 text-sm text-center mt-3">
                {images[selectedImageIndex].caption}
              </p>
            )}

            {/* Navigation controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3
                            bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={() => setSelectedImageIndex((p) => (p - 1 + images.length) % images.length)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {selectedImageIndex + 1} / {images.length}
              </span>
              <button
                onClick={() => setSelectedImageIndex((p) => (p + 1) % images.length)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Download button */}
            <a
              href={images[selectedImageIndex].url}
              download={`container-${container.container_number}-photo-${selectedImageIndex + 1}.jpg`}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full
                         hover:bg-black/80 text-white transition-colors"
            >
              <Download size={18} />
            </a>

            {/* Close lightbox */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-3 left-3 p-2 bg-black/60 rounded-full
                         hover:bg-black/80 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i) }}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all
                    ${i === selectedImageIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

/**
 * DetailCard
 * ----------
 * Small card component for a single piece of container metadata.
 * Only used inside ContainerResultModal so defined here.
 */
function DetailCard({ label, value, icon }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white font-medium text-sm">{value || '—'}</p>
    </div>
  )
}
