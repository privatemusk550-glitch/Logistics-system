import { useState } from 'react'
import { supabase } from "@/lib/supabase";
import { useNavigate } from 'react-router-dom'

const CreatePackage = () => {
  const navigate = useNavigate()

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    tracking_number: '',
    sender_name: '',
    sender_email: '',
    sender_address: '',
    receiver_name: '',
    receiver_email: '',
    receiver_address: '',
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Not authenticated")
      setLoading(false)
      return
    }

    // 1️⃣ Create package first
    const { data: pkg, error } = await supabase
      .from('packages')
      .insert([
        {
          admin_id: user.id,
          tracking_number: form.tracking_number,
          sender_name: form.sender_name,
          sender_email: form.sender_email,
          sender_address: form.sender_address,
          receiver_name: form.receiver_name,
          receiver_email: form.receiver_email,
          receiver_address: form.receiver_address,
          status: 'Awaiting Parcel'
        },
      ])
      .select()
      .single()

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // 2️⃣ Upload images (if any)
    for (let file of images) {
      const safeName = file.name.replace(/\s+/g, '-')
      const fileName = `${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(fileName, file)

      if (!uploadError) {
        await supabase.from('package_images').insert({
          package_id: pkg.id,
          image_path: fileName,
        })
      }
    }

    // 3️⃣ Create initial shipment event
    await supabase
      .from('shipment_events')
      .insert([
        {
          package_id: pkg.id,
          status: 'Shipment Created',
          location: 'Origin Facility',
          event_time: new Date().toISOString(),
        },
      ])

    setLoading(false)
    navigate('/dashboard/packages')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">
          Create New Package
        </h2>
        <p className="text-sm text-gray-500">
          Enter shipment details below
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-8 rounded-xl shadow"
      >

        <div>
          <h3 className="font-semibold mb-4">Tracking Info</h3>
          <input
            name="tracking_number"
            placeholder="Tracking Number"
            value={form.tracking_number}
            onChange={handleChange}
            required
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        {/* Multiple Image Upload */}
        <div>
          <h3 className="font-semibold mb-4">Upload Images</h3>
          <input
            type="file"
            multiple
            onChange={(e) => setImages([...e.target.files])}
            className="w-full border rounded-md px-4 py-2"
          />
        </div>

        {/* Sender + Receiver same as before */}
        {/* Sender */} 
        <div className="grid md:grid-cols-2 gap-6"> <div className="space-y-4">
           <h3 className="font-semibold">Sender</h3> 
           
           <input name="sender_name" placeholder="Sender Name" value={form.sender_name} onChange={handleChange} required className="w-full border rounded-md px-4 py-2" /> 
           
           <input name="sender_email" placeholder="Sender Email" value={form.sender_email} onChange={handleChange} className="w-full border rounded-md px-4 py-2" /> 
           
           <textarea name="sender_address" placeholder="Sender Address" value={form.sender_address} onChange={handleChange} className="w-full border rounded-md px-4 py-2" /> 
           </div> 
        {/* Receiver */} 
        <div className="space-y-4"> 
          <h3 className="font-semibold">Receiver</h3>

           <input name="receiver_name" placeholder="Receiver Name" value={form.receiver_name} onChange={handleChange} required className="w-full border rounded-md px-4 py-2" />
           
            <input name="receiver_email" placeholder="Receiver Email" value={form.receiver_email} onChange={handleChange} className="w-full border rounded-md px-4 py-2" /> 
            
            <textarea name="receiver_address" placeholder="Receiver Address" value={form.receiver_address} onChange={handleChange} className="w-full border rounded-md px-4 py-2" /> </div> </div>

        <div>
          <button
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md"
          >
            {loading ? 'Creating...' : 'Create Package'}
          </button>
        </div>

      </form>
    </div>
  )
}

export default CreatePackage
