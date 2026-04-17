import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Books', 'Electronics', 'Clothing', 'Furniture', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair']

export default function UploadItemModal({ onClose }) {
  const minExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    condition: 'Good',
    seller_whatsapp: '',
    expires_at: '',
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleImages = e => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    imagePreviews.forEach(url => URL.revokeObjectURL(url))
    setImageFiles(selectedFiles)
    setImagePreviews(selectedFiles.map(file => URL.createObjectURL(file)))
  }

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  useEffect(() => {
    const onEscape = e => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [onClose])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be signed in to post a listing.')
      if (!user.email?.toLowerCase().endsWith('@nsec.ac.in')) {
        throw new Error('Only @nsec.ac.in accounts can create listings.')
      }

      const parsedPrice = Number.parseInt(form.price, 10)
      if (!Number.isInteger(parsedPrice) || parsedPrice < 1) {
        throw new Error('Price must be a positive number.')
      }

      const normalizedTitle = form.title.trim()
      if (!normalizedTitle) {
        throw new Error('Item title is required.')
      }

      const sanitizedWhatsapp = form.seller_whatsapp.replace(/\D/g, '')
      if (sanitizedWhatsapp.length < 10) {
        throw new Error('Please enter a valid WhatsApp number with country code.')
      }

      const expiryDate = new Date(form.expires_at)
      if (Number.isNaN(expiryDate.getTime())) {
        throw new Error('Please provide a valid expiry date.')
      }
      if (expiryDate <= new Date()) {
        throw new Error('Expiry date must be in the future.')
      }

      const uploadedImageUrls = []
      for (const [index, imageFile] of imageFiles.entries()) {
        if (!imageFile.type.startsWith('image/')) {
          throw new Error('Only image uploads are allowed.')
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Each image must be under 5MB.')
        }

        const ext = imageFile.name.split('.').pop()
        const filename = `${user.id}/${Date.now()}-${index}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filename, imageFile, {
            cacheControl: '3600',
            contentType: imageFile.type,
            upsert: false,
          })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('item-images')
          .getPublicUrl(filename)
        uploadedImageUrls.push(urlData.publicUrl)
      }

      const imagePayload =
        uploadedImageUrls.length > 1
          ? JSON.stringify(uploadedImageUrls)
          : (uploadedImageUrls[0] || null)

      const { error: insertError } = await supabase.from('items').insert({
        seller_id: user.id,
        seller_name: user.email.split('@')[0],
        seller_whatsapp: sanitizedWhatsapp,
        title: normalizedTitle,
        description: form.description.trim(),
        price: parsedPrice,
        category: form.category,
        condition: form.condition,
        image_url: imagePayload,
        expires_at: expiryDate.toISOString(),
      })

      if (insertError) throw insertError
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto border-[4px]"
        style={{ background: 'var(--card-main)', borderColor: 'var(--border-main)', boxShadow: '8px 8px 0px 0px var(--shadow-hard)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b-[4px]" style={{ borderColor: 'var(--border-main)' }}>
          <h2 className="text-lg font-black uppercase tracking-wide text-text-main">
            List an Item
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl font-black border-[4px] px-3 py-1 leading-none"
            style={{ color: 'var(--text-main)', borderColor: 'var(--border-main)', background: 'var(--card-main)' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4" id="upload-item-form">
          <div>
            <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">
              Photos
            </label>
            <label
              className="block w-full border-[4px] border-dashed p-5 cursor-pointer text-center"
              style={{ borderColor: 'var(--border-main)', background: 'var(--surface-muted)' }}
            >
              <p className="text-sm font-black uppercase tracking-wide text-text-main">
                Drop or choose images (multiple allowed)
              </p>
              <p className="text-xs font-bold mt-1 text-text-main">
                JPG / PNG / WEBP under 5MB each
              </p>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                {imagePreviews.map((preview, idx) => (
                  <div key={preview} className="aspect-square border-[4px]" style={{ borderColor: 'var(--border-main)' }}>
                    <img src={preview} alt={`Selected ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">Item Title *</label>
            <input id="title-input" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Engineering Physics textbook" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">Price (₹) *</label>
            <input id="price-input" name="price" type="number" value={form.price} onChange={handleChange} required min="1" placeholder="200" className="input-field" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">Category *</label>
              <select id="category-select" name="category" value={form.category} onChange={handleChange} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">Condition *</label>
              <select id="condition-select" name="condition" value={form.condition} onChange={handleChange} className="input-field">
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">WhatsApp Number *</label>
            <input id="whatsapp-input" name="seller_whatsapp" value={form.seller_whatsapp} onChange={handleChange} required placeholder="919XXXXXXXXX" className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">Expiry *</label>
            <input id="expiry-input" name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange} min={minExpiry} required className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wide mb-2 text-text-main">Description</label>
            <textarea id="description-input" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Any extra details..." className="input-field resize-none" />
          </div>

          {error && <p className="text-sm font-black uppercase" style={{ color: '#FF2D55' }}>{error}</p>}

          <button id="submit-listing-btn" type="submit" disabled={loading} className="w-full border-[4px] py-3 px-4 text-sm font-black uppercase tracking-wide disabled:opacity-60" style={{ color: 'var(--bg-main)', background: '#ff3366', borderColor: 'var(--border-main)', boxShadow: '8px 8px 0px 0px var(--shadow-hard)' }}>
            {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
