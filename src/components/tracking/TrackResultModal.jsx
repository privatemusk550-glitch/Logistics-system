/**
 * TrackResultModal.jsx
 * ---------------------
 * Modal that appears after a successful package search.
 *
 * KEY NEW FEATURES:
 * 1. Gallery-style image viewer with lightbox (click an image to open it full screen)
 * 2. Thumbnail previews so user can see images before opening
 * 3. Navigation arrows in the lightbox (prev/next)
 * 4. Keyboard support: ESC closes, arrow keys navigate
 * 5. Uses react-i18next for translations
 *
 * For junior devs:
 * - The "lightbox" is just a full-screen overlay div that shows one image at a time
 * - We track which image is selected with `selectedImageIndex` (null = closed)
 * - useEffect with keyboard listener lets the user press ESC or arrow keys
 */

import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import emailjs from '@emailjs/browser'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Package, User, MapPin, Clock } from 'lucide-react'

export default function TrackResultModal({ pkg, onClose }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Array of signed image URLs fetched from Supabase Storage
  const [images, setImages] = useState([])

  // Index of the image open in the lightbox. null means lightbox is closed.
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)

  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')

  // ── Fetch package images from Supabase ──────────────────────────────────
  useEffect(() => {
    if (!pkg?.id) return

    async function loadImages() {
      // Step 1: Get the list of image records for this package
      const { data } = await supabase
        .from('package_images')
        .select('*')
        .eq('package_id', pkg.id)

      if (!data || data.length === 0) return

      // Step 2: Create a temporary signed URL for each image (valid 60 seconds)
      // Signed URLs are needed because the storage bucket is private
      const signed = []
      for (let img of data) {
        const { data: signedData } = await supabase.storage
          .from('package-images')
          .createSignedUrl(img.image_path, 60)

        if (signedData?.signedUrl) {
          signed.push(signedData.signedUrl)
        }
      }

      setImages(signed)
    }

    loadImages()
  }, [pkg])

  // ── Keyboard navigation for the lightbox ────────────────────────────────
  // useCallback wraps the function so it doesn't re-create on every render
  const handleKeyDown = useCallback((e) => {
    if (selectedImageIndex === null) return // lightbox not open

    if (e.key === 'Escape') {
      setSelectedImageIndex(null) // close lightbox
    } else if (e.key === 'ArrowRight') {
      // Go to next image, wrap around to start if at the end
      setSelectedImageIndex((prev) => (prev + 1) % images.length)
    } else if (e.key === 'ArrowLeft') {
      // Go to previous image, wrap around to end if at the start
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [selectedImageIndex, images.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown) // cleanup
  }, [handleKeyDown])

  // ── Navigate to or create a customer chat ──────────────────────────────
  async function goToChat() {
    setChatError('')
    setChatLoading(true)

    // Check if there's already an open chat for this package
    const { data: existing } = await supabase
      .from('chats')
      .select('id')
      .eq('package_id', pkg.id)
      .eq('status', 'open')
      .limit(1)

    if (existing?.length > 0) {
      navigate(`/chat/${existing[0].id}`)
      setChatLoading(false)
      return
    }

    // No existing chat — create a new one
    const { data: newChat, error } = await supabase
      .from('chats')
      .insert({
        package_id: pkg.id,
        admin_id: pkg.admin_id,
        customer_name: 'Guest User'
      })
      .select()
      .single()

    if (error) {
      setChatError(error.message || 'Failed to create chat')
      setChatLoading(false)
      return
    }

    // Add a welcome message from the system so chat isn't empty
    try {
      await supabase.from('chat_messages').insert({
        chat_id: newChat.id,
        sender: 'admin',
        message: 'Thanks for reaching out. Please wait while we connect you to customer care. 👋'
      })
    } catch (err) {
      console.warn('[TrackResultModal] failed to insert welcome message', err)
    }

    // Notify admin via email
    try {
      const { data: admin } = await supabase
        .from('admin_public_emails')
        .select('email')
        .eq('id', pkg.admin_id)
        .single()

      if (admin?.email) {
        await emailjs.send(
          'service_hp7tcgb',
          'template_5ykzgam',
          {
            to_email: admin.email,
            customer_name: pkg?.sender_name || pkg?.receiver_name || 'Guest User',
            tracking_number: pkg?.tracking_number,
            chat_link: `${window.location.origin}/admin/chat/${newChat.id}`,
          },
          'yRmDqe6CPNJQOzgti'
        )
      }
    } catch (err) {
      console.warn('[TrackResultModal] email notification failed', err)
    }

    try {
      navigate(`/chat/${newChat.id}`)
    } catch (err) {
      setChatError('Failed to open chat')
    } finally {
      setChatLoading(false)
    }
  }

  // ── Status badge colour ────────────────────────────────────────────────
  function getStatusStyle(status) {
    const s = status?.toLowerCase() || ''
    if (s.includes('deliver')) return 'bg-green-500/20 text-green-300 border-green-500/30'
    if (s.includes('await')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    if (s.includes('transit') || s.includes('ship')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    return 'bg-white/10 text-white border-white/20'
  }

  return (
    <>
      {/* ── Main Modal Overlay ────────────────────────────────────────── */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto
                        bg-gradient-to-br from-slate-800 to-slate-900
                        border border-white/10 shadow-2xl rounded-2xl">

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20
                       text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-6 md:p-8 space-y-6 text-white">

            {/* ── Header: Tracking number + status ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                            pb-6 border-b border-white/10">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  {t('modal.tracking')}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  {pkg.tracking_number}
                </h2>
              </div>

              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                               border ${getStatusStyle(pkg?.status)}`}>
                <Package size={14} className="mr-2" />
                {pkg?.status}
              </span>
            </div>

            {/* ── Sender / Receiver info ── */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Sender card */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider mb-3">
                  <User size={14} />
                  <span>{t('modal.sender')}</span>
                </div>
                <InfoRow label={t('modal.senderName')} value={pkg.sender_name} />
                <InfoRow label={t('modal.senderEmail')} value={pkg.sender_email} />
              </div>

              {/* Receiver card */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider mb-3">
                  <MapPin size={14} />
                  <span>{t('modal.receiver')}</span>
                </div>
                <InfoRow label={t('modal.receiverName')} value={pkg.receiver_name} />
                <InfoRow label={t('modal.receiverEmail')} value={pkg.receiver_email} />
                <InfoRow label={t('modal.receiverAddress')} value={pkg.receiver_address} />
              </div>
            </div>

            {/* ── Shipment Timeline ── */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={16} className="text-white/60" />
                <h3 className="font-semibold">{t('modal.timeline')}</h3>
              </div>

              {/* Sort events newest first */}
              <div className="space-y-4">
                {pkg.shipment_events
                  ?.sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
                  .map((event, index, arr) => (
                    <div key={event.id} className="flex gap-4">

                      {/* Timeline dot + connecting line */}
                      <div className="flex flex-col items-center flex-shrink-0 mt-1">
                        <div className={`w-3 h-3 rounded-full border-2
                          ${index === 0 ? 'bg-blue-400 border-blue-400' : 'bg-transparent border-white/40'}`}
                        />
                        {index < arr.length - 1 && (
                          <div className="flex-1 w-px bg-white/20 my-1" style={{ minHeight: '20px' }} />
                        )}
                      </div>

                      {/* Event details */}
                      <div className="pb-4">
                        <p className="font-medium text-sm">{event.status}</p>
                        <p className="text-xs text-white/50">{event.location}</p>
                        <p className="text-xs text-white/40 mt-1">
                          {new Date(event.event_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* ── Image Gallery (thumbnail previews) ── */}
            {images.length > 0 && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="font-semibold mb-4">{t('modal.images')}</h3>

                {/* Thumbnail grid — click any image to open lightbox */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className="relative group rounded-lg overflow-hidden border border-white/10
                                 hover:border-white/40 transition-all duration-200 aspect-square"
                    >
                      {/* Thumbnail image */}
                      <img
                        src={url}
                        alt={`Package image ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Hover overlay with zoom icon */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                      transition-opacity duration-200 flex items-center justify-center">
                        <ZoomIn size={24} className="text-white" />
                      </div>

                      {/* Image number badge */}
                      <span className="absolute top-2 left-2 bg-black/50 text-white text-xs
                                       rounded-full px-2 py-0.5">
                        {i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Customer Chat Button ── */}
            <button
              onClick={goToChat}
              disabled={chatLoading}
              className="w-full py-3.5 bg-aramexRed hover:bg-red-700 disabled:opacity-60
                         text-white font-semibold rounded-xl transition-colors"
            >
              {chatLoading ? t('modal.chatLoading') : t('modal.chat')}
            </button>

            {chatError && (
              <p className="text-red-400 text-sm text-center">{chatError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox (full screen image viewer) ──────────────────────── */}
      {selectedImageIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setSelectedImageIndex(null)} // clicking outside closes
        >
          {/* Stop click from bubbling when clicking image itself */}
          <div
            className="relative max-w-5xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Main image */}
            <img
              src={images[selectedImageIndex]}
              alt={`Package image ${selectedImageIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />

            {/* ── Controls bar ── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3
                            bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
              {/* Prev button */}
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Image counter */}
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {selectedImageIndex + 1} / {images.length}
              </span>

              {/* Next button */}
              <button
                onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Download button */}
            <a
              href={images[selectedImageIndex]}
              download={`package-image-${selectedImageIndex + 1}.jpg`}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full
                         hover:bg-black/80 text-white transition-colors"
              aria-label="Download image"
            >
              <Download size={18} />
            </a>

            {/* Close lightbox button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-3 left-3 p-2 bg-black/60 rounded-full
                         hover:bg-black/80 text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Thumbnail strip at bottom of lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 mt-4 px-4">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(i); }}
                  className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all
                    ${i === selectedImageIndex ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
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
 * InfoRow
 * -------
 * Small helper component to display a label-value pair consistently.
 * Keeping it here (not a separate file) since it's only used in this modal.
 */
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-sm font-medium text-white mt-0.5">{value || '—'}</p>
    </div>
  )
}
