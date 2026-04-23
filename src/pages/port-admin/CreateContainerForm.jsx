/**
 * CreateContainerForm.jsx
 * ------------------------
 * Form for port admins to add a new container to the database.
 *
 * Fields:
 * - Container number (required, e.g. MSKU1234567)
 * - Container type (20ft, 40ft, 40ft HC, Reefer, etc.)
 * - Owner / Client name
 * - Gross weight in kg
 * - Cargo description
 * - Port of loading
 * - Port of discharge
 * - Expected arrival date (ETA)
 * - Vessel name
 * - Voyage number
 * - Initial status
 * - Upload container photos
 *
 * Props:
 * - onSuccess: called after successful creation (navigates back to list)
 * - onCancel: called when user clicks cancel
 * - adminId: the logged-in admin's Supabase user ID
 *
 * For junior devs:
 * - handleSubmit first inserts the container record, then uploads images
 * - Images go to Supabase Storage bucket 'container-images'
 * - Each image filename is stored in the `container_images` table
 */

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, X, Plus } from 'lucide-react'

const CONTAINER_TYPES = ['20ft Dry', '40ft Dry', '40ft High Cube', '20ft Reefer', '40ft Reefer', 'Open Top', 'Flat Rack', 'Tank', 'Other']
const STATUS_OPTIONS = ['Pending', 'Vessel Loaded', 'In Transit', 'Arrived at Port', 'Awaiting Customs', 'Customs Cleared', 'Released', 'On Hold', 'Delivered']

export default function CreateContainerForm({ onSuccess, onCancel, adminId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Image files selected by the admin
  const [imageFiles, setImageFiles] = useState([])

  // Preview URLs (blob URLs) for selected images — shown as thumbnails before upload
  const [imagePreviews, setImagePreviews] = useState([])

  // Form field values
  const [form, setForm] = useState({
    container_number: '',
    container_type: '40ft Dry',
    owner_name: '',
    gross_weight_kg: '',
    cargo_description: '',
    port_of_loading: '',
    port_of_discharge: '',
    eta: '',
    vessel_name: '',
    voyage_number: '',
    status: 'Pending',
  })

  // Generic field updater — works for all inputs
  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Handle image file selection — create preview thumbnails
  function handleImageSelect(e) {
    const files = Array.from(e.target.files)
    setImageFiles(files)

    // Create temporary blob URLs for previewing before upload
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(previews)
  }

  // Remove a selected image from the list
  function removeImage(index) {
    URL.revokeObjectURL(imagePreviews[index]) // free memory
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate container number format: 4 uppercase letters + 7 digits
    const cnRegex = /^[A-Z]{4}\d{7}$/
    const cn = form.container_number.trim().toUpperCase()
    if (!cnRegex.test(cn)) {
      setError('Container number must be 4 letters followed by 7 digits (e.g. MSKU1234567)')
      setLoading(false)
      return
    }

    // Step 1: Insert the container record
    const { data: container, error: insertError } = await supabase
      .from('containers')
      .insert({
        admin_id: adminId,
        container_number: cn,
        container_type: form.container_type,
        owner_name: form.owner_name || null,
        gross_weight_kg: form.gross_weight_kg ? parseFloat(form.gross_weight_kg) : null,
        cargo_description: form.cargo_description || null,
        port_of_loading: form.port_of_loading,
        port_of_discharge: form.port_of_discharge,
        eta: form.eta || null,
        vessel_name: form.vessel_name || null,
        voyage_number: form.voyage_number || null,
        status: form.status,
      })
      .select()
      .single()

    if (insertError) {
      // Check for duplicate container number
      if (insertError.code === '23505') {
        setError('A container with this number already exists.')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    // Step 2: Upload each image to Supabase Storage
    for (let file of imageFiles) {
      // Make the filename safe (no spaces) and unique (timestamp prefix)
      const safeName = file.name.replace(/\s+/g, '-')
      const fileName = `${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('container-images') // Must create this bucket in Supabase dashboard
        .upload(fileName, file)

      if (!uploadError) {
        // Step 3: Store the image reference in the database
        await supabase.from('container_images').insert({
          container_id: container.id,
          image_path: fileName,
          caption: '', // Admin can add captions later in the detail view
        })
      } else {
        console.warn('[CreateContainerForm] image upload failed:', uploadError.message)
      }
    }

    // Step 4: Create an initial event in the timeline
    await supabase.from('container_events').insert({
      container_id: container.id,
      event_type: 'Container Registered',
      location: form.port_of_loading,
      description: `Container ${cn} registered in the system.`,
      event_time: new Date().toISOString(),
    })

    setLoading(false)
    onSuccess() // Tell the parent we're done — navigate back to list
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Register New Container</h2>
        <p className="text-gray-500 text-sm mt-1">Fill in the container details below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Container Identity ── */}
        <FormSection title="Container Identity">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Container Number *" hint="4 letters + 7 digits (e.g. MSKU1234567)">
              <input
                name="container_number"
                value={form.container_number}
                onChange={handleChange}
                required
                placeholder="MSKU1234567"
                className="input uppercase"
                maxLength={11}
              />
            </FormField>

            <FormField label="Container Type">
              <select name="container_type" value={form.container_type} onChange={handleChange} className="input">
                {CONTAINER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Vessel Name">
              <input name="vessel_name" value={form.vessel_name} onChange={handleChange} placeholder="e.g. MSC Gülsün" className="input" />
            </FormField>
            <FormField label="Voyage Number">
              <input name="voyage_number" value={form.voyage_number} onChange={handleChange} placeholder="e.g. 0VB8W1MA" className="input" />
            </FormField>
          </div>
        </FormSection>

        {/* ── Owner & Cargo ── */}
        <FormSection title="Owner & Cargo">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Owner / Client Name">
              <input name="owner_name" value={form.owner_name} onChange={handleChange} placeholder="e.g. ABC Trading Ltd" className="input" />
            </FormField>
            <FormField label="Gross Weight (kg)">
              <input name="gross_weight_kg" type="number" value={form.gross_weight_kg} onChange={handleChange} placeholder="e.g. 24000" className="input" />
            </FormField>
          </div>

          <FormField label="Cargo Description">
            <textarea
              name="cargo_description"
              value={form.cargo_description}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Electronic goods, mixed consumer products"
              className="input resize-none"
            />
          </FormField>
        </FormSection>

        {/* ── Route & Status ── */}
        <FormSection title="Route & Status">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Port of Loading *">
              <input name="port_of_loading" value={form.port_of_loading} onChange={handleChange} required placeholder="e.g. Shanghai, China" className="input" />
            </FormField>
            <FormField label="Port of Discharge *">
              <input name="port_of_discharge" value={form.port_of_discharge} onChange={handleChange} required placeholder="e.g. Lagos, Nigeria" className="input" />
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Expected Arrival (ETA)">
              <input name="eta" type="datetime-local" value={form.eta} onChange={handleChange} className="input" />
            </FormField>
            <FormField label="Initial Status">
              <select name="status" value={form.status} onChange={handleChange} className="input">
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
        </FormSection>

        {/* ── Image Upload ── */}
        <FormSection title="Container Photos">
          <p className="text-sm text-gray-500 mb-4">
            Upload photos of the container (exterior, interior, seals, etc.)
          </p>

          {/* File picker */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2
                             border-dashed border-gray-300 rounded-xl cursor-pointer
                             hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload size={24} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Click to select images</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — up to 5MB each</span>
            <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>

          {/* Preview thumbnails */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative group aspect-square">
                  <img
                    src={preview}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white
                               opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* ── Error & Actions ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700
                       text-white font-semibold rounded-xl transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            {loading ? 'Creating...' : 'Create Container'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium
                       rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// Small layout helpers (no need for separate files since they're only used here)
function FormSection({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider border-b
                     border-gray-100 pb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

function FormField({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  )
}
