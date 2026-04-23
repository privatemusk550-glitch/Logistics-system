/**
 * ContainerDetailView.jsx
 * ------------------------
 * Detail view for a single container — shown when admin clicks on a container
 * in the dashboard list.
 *
 * WHAT ADMINS CAN DO HERE:
 * 1. Update the container status
 * 2. Add new port events (timestamped entries in the timeline)
 * 3. Upload new photos
 * 4. View existing timeline and photos
 * 5. Delete events (in case of error)
 *
 * For junior devs:
 * - We use `containerId` prop to fetch fresh data from Supabase
 * - After any update, we re-fetch the container to keep data in sync
 * - Image uploads follow the same pattern as CreateContainerForm
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Clock, MapPin, Upload, Plus, Trash2, X,
  ChevronLeft, Ship, AlertCircle, CheckCircle, Loader
} from 'lucide-react'

const STATUS_OPTIONS = ['Pending', 'Vessel Loaded', 'In Transit', 'Arrived at Port', 'Awaiting Customs', 'Customs Cleared', 'Released', 'On Hold', 'Delivered']
const EVENT_TYPES = ['Vessel Loaded', 'Departed Port', 'In Transit', 'Arrived at Port', 'Berth Assigned', 'Customs Declaration Filed', 'Customs Cleared', 'Customs Hold', 'Released from Port', 'Delivered to Client', 'Damaged - Report Filed', 'Other']

export default function ContainerDetailView({ containerId, onBack }) {
  const [container, setContainer] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success'|'error', msg: string }

  // New event form
  const [newEvent, setNewEvent] = useState({ event_type: 'Arrived at Port', location: '', description: '' })

  // New image files to upload
  const [newImages, setNewImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  // ── Load container data ───────────────────────────────────────────────
  useEffect(() => {
    fetchContainer()
  }, [containerId])

  async function fetchContainer() {
    setLoading(true)

    const { data, error } = await supabase
      .from('containers')
      .select(`
        *,
        container_events ( id, event_type, location, description, event_time ),
        container_images ( id, image_path, caption )
      `)
      .eq('id', containerId)
      .single()

    if (!error && data) {
      setContainer(data)
      // Load signed URLs for images
      await loadSignedUrls(data.container_images || [])
    }

    setLoading(false)
  }

  async function loadSignedUrls(imgRecords) {
    const signed = []
    for (let img of imgRecords) {
      const { data } = await supabase.storage
        .from('container-images')
        .createSignedUrl(img.image_path, 300) // 5 minute URL for admin view
      if (data?.signedUrl) {
        signed.push({ ...img, signedUrl: data.signedUrl })
      }
    }
    setImages(signed)
  }

  // ── Show temporary feedback message ──────────────────────────────────
  function showFeedback(type, msg) {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  // ── Update container status ───────────────────────────────────────────
  async function updateStatus(newStatus) {
    setSaving(true)
    const { error } = await supabase
      .from('containers')
      .update({ status: newStatus })
      .eq('id', containerId)

    if (error) {
      showFeedback('error', 'Failed to update status')
    } else {
      showFeedback('success', 'Status updated successfully')
      fetchContainer()
    }
    setSaving(false)
  }

  // ── Add a new port event ──────────────────────────────────────────────
  async function addEvent(e) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('container_events').insert({
      container_id: containerId,
      event_type: newEvent.event_type,
      location: newEvent.location,
      description: newEvent.description || null,
      event_time: new Date().toISOString(),
    })

    if (error) {
      showFeedback('error', 'Failed to add event')
    } else {
      showFeedback('success', 'Event added')
      setNewEvent({ event_type: 'Arrived at Port', location: '', description: '' })
      fetchContainer()
    }
    setSaving(false)
  }

  // ── Delete a port event ───────────────────────────────────────────────
  async function deleteEvent(eventId) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return

    const { error } = await supabase
      .from('container_events')
      .delete()
      .eq('id', eventId)

    if (!error) fetchContainer()
  }

  // ── Upload new photos ─────────────────────────────────────────────────
  async function uploadImages(e) {
    e.preventDefault()
    if (newImages.length === 0) return
    setSaving(true)

    for (let file of newImages) {
      const safeName = file.name.replace(/\s+/g, '-')
      const fileName = `${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('container-images')
        .upload(fileName, file)

      if (!uploadError) {
        await supabase.from('container_images').insert({
          container_id: containerId,
          image_path: fileName,
          caption: '',
        })
      }
    }

    // Clear selected files and previews
    setNewImages([])
    setImagePreviews(prev => { prev.forEach(u => URL.revokeObjectURL(u)); return [] })
    showFeedback('success', `${newImages.length} photo(s) uploaded`)
    fetchContainer()
    setSaving(false)
  }

  // ── Delete an image ───────────────────────────────────────────────────
  async function deleteImage(img) {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return

    // Delete from storage
    await supabase.storage.from('container-images').remove([img.image_path])

    // Delete from database
    await supabase.from('container_images').delete().eq('id', img.id)

    fetchContainer()
  }

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={24} className="text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!container) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Container not found.</p>
        <button onClick={onBack} className="text-blue-500 mt-2 text-sm hover:underline">← Go back</button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm mb-2 transition-colors"
          >
            <ChevronLeft size={16} /> Back to list
          </button>
          <h2 className="text-2xl font-bold text-gray-800 font-mono">
            {container.container_number}
          </h2>
          <p className="text-gray-500 text-sm">
            {container.vessel_name} {container.voyage_number ? `· Voyage ${container.voyage_number}` : ''}
          </p>
        </div>

        {/* Current status badge */}
        <span className={`px-4 py-2 rounded-full text-sm font-semibold
          ${container.status?.toLowerCase().includes('cleared') ? 'bg-green-100 text-green-700' :
            container.status?.toLowerCase().includes('hold') ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'}`}>
          {container.status}
        </span>
      </div>

      {/* ── Feedback toast ── */}
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
          ${feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            'bg-red-50 text-red-700 border border-red-200'}`}>
          {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* ── Update Status ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving || container.status === s}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                ${container.status === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Add Port Event ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Add Port Event</h3>

        <form onSubmit={addEvent} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Event Type</label>
              <select
                value={newEvent.event_type}
                onChange={e => setNewEvent(p => ({ ...p, event_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Location</label>
              <input
                required
                value={newEvent.location}
                onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Apapa Port, Lagos"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Notes (optional)</label>
            <input
              value={newEvent.description}
              onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
              placeholder="Additional details..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-semibold rounded-lg transition-colors
                       disabled:opacity-60"
          >
            <Plus size={16} />
            {saving ? 'Saving...' : 'Add Event'}
          </button>
        </form>
      </div>

      {/* ── Event Timeline ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          Port Event History
        </h3>

        {container.container_events?.length === 0 ? (
          <p className="text-gray-400 text-sm">No events recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {container.container_events
              .sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
              .map((event, index, arr) => (
                <div key={event.id} className="flex gap-4 group">
                  {/* Dot and line */}
                  <div className="flex flex-col items-center mt-1 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full border-2
                      ${index === 0 ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-300'}`}
                    />
                    {index < arr.length - 1 && (
                      <div className="flex-1 w-px bg-gray-200 my-1" style={{ minHeight: '20px' }} />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="pb-4 flex-1 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{event.event_type}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin size={10} /> {event.location}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.event_time).toLocaleString()}
                      </p>
                    </div>

                    {/* Delete event button */}
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400
                                 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete event"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ── Photo Management ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Container Photos</h3>

        {/* Upload new photos */}
        <form onSubmit={uploadImages} className="mb-6">
          <label className="flex flex-col items-center justify-center w-full h-24 border-2
                             border-dashed border-gray-300 rounded-xl cursor-pointer
                             hover:border-blue-400 hover:bg-blue-50 transition-colors mb-3">
            <Upload size={20} className="text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Click to add more photos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files)
                setNewImages(files)
                setImagePreviews(prev => {
                  prev.forEach(u => URL.revokeObjectURL(u))
                  return files.map(f => URL.createObjectURL(f))
                })
              }}
              className="hidden"
            />
          </label>

          {/* Preview new images */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-3">
              {imagePreviews.map((url, i) => (
                <img key={i} src={url} alt="" className="aspect-square object-cover rounded-lg border border-gray-200" />
              ))}
            </div>
          )}

          {newImages.length > 0 && (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700
                         text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              <Upload size={16} />
              {saving ? 'Uploading...' : `Upload ${newImages.length} photo(s)`}
            </button>
          )}
        </form>

        {/* Existing photos grid */}
        {images.length === 0 ? (
          <p className="text-gray-400 text-sm">No photos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group aspect-square">
                <img
                  src={img.signedUrl}
                  alt={img.caption || 'Container photo'}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
                {/* Delete button on hover */}
                <button
                  onClick={() => deleteImage(img)}
                  className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 rounded-full text-white
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete photo"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
