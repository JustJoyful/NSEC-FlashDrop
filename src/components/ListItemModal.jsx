import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getSellerUsername, parseItemImages } from '../lib/itemMedia'
import FomoBadge from './FomoBadge'

function openWhatsApp(sellerPhone, itemTitle, price) {
  const message = encodeURIComponent(
    `Hi! I saw your listing on NSEC FlashDrop — *${itemTitle}* for ₹${price}. Is it still available? I can come pick it up today!`
  )
  window.open(`https://wa.me/${sellerPhone}?text=${message}`, '_blank')
}

export default function ListItemModal({ item, currentUser, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState('')
  const [interestedCount, setInterestedCount] = useState(Number(item?.interested_count) || 0)
  const navigate = useNavigate()

  const images = useMemo(() => parseItemImages(item), [item])
  const activeImage = images[activeImageIndex] || null
  const sellerUsername = getSellerUsername(item).toUpperCase()

  useEffect(() => {
    const onEscape = event => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [onClose])

  useEffect(() => {
    setInterestedCount(Number(item?.interested_count) || 0)
  }, [item?.id, item?.interested_count])

  const handleClaim = async () => {
    setError('')

    if (!item?.seller_whatsapp) {
      setError('Seller WhatsApp is missing for this listing.')
      return
    }
    if (!currentUser) {
      setError('Sign in with your NSEC email to claim this item.')
      onClose()
      navigate('/login')
      return
    }

    setClaiming(true)
    try {
      const { data: insertedRows, error: interestError } = await supabase
        .from('interest_clicks')
        .upsert(
          { item_id: item.id, user_id: currentUser.id },
          { onConflict: 'item_id,user_id', ignoreDuplicates: true }
        )
        .select('id')

      if (interestError) throw interestError

      if (insertedRows?.length) {
        const { error: rpcError } = await supabase.rpc('increment_interest', { item_id: item.id })
        if (rpcError) throw rpcError
        setInterestedCount(prev => prev + 1)
      }

      openWhatsApp(item.seller_whatsapp, item.title, item.price)
    } catch (claimError) {
      setError(claimError.message || 'Could not claim item right now.')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[94vh] overflow-y-auto border-[4px]"
        style={{ background: 'var(--card-main)', borderColor: 'var(--border-main)', boxShadow: '8px 8px 0px 0px var(--shadow-hard)' }}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-[4px]" style={{ borderColor: 'var(--border-main)' }}>
          <h2 className="text-sm sm:text-lg font-black uppercase tracking-wide text-text-main">
            Listing Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-lg sm:text-xl font-black border-[4px] px-3 py-1 leading-none"
            style={{ color: 'var(--text-main)', borderColor: 'var(--border-main)', background: 'var(--card-main)' }}
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-4 sm:p-5 border-b-[4px] md:border-b-0 md:border-r-[4px]" style={{ borderColor: 'var(--border-main)' }}>
            <div className="w-full aspect-square border-[4px] flex items-center justify-center overflow-hidden" style={{ borderColor: 'var(--border-main)', background: 'var(--surface-muted)' }}>
              {activeImage ? (
                <img src={activeImage} alt={item?.title || 'Listing image'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black uppercase tracking-wide text-text-main">
                  No Image
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-3">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className="aspect-square border-[4px] overflow-hidden"
                    style={{
                      borderColor: activeImageIndex === idx ? '#ff3366' : 'var(--border-main)',
                      boxShadow: activeImageIndex === idx ? '4px 4px 0px 0px var(--shadow-hard)' : 'none',
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 flex flex-col min-h-[420px]">
            <p className="text-xs font-black uppercase tracking-wide mb-2 text-text-main">
              Seller: {sellerUsername}
            </p>

            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-text-main">
              {item?.title}
            </h3>

            <p className="inline-block mt-3 text-xl sm:text-2xl font-black uppercase px-3 py-1 border-[4px]" style={{ background: 'var(--price-bg)', color: 'var(--price-text)', borderColor: 'var(--border-main)', boxShadow: '6px 6px 0px 0px var(--shadow-hard)' }}>
              ₹{item?.price}
            </p>

            <div className="mt-3">
              <FomoBadge count={interestedCount} />
            </div>

            <div className="mt-5 border-[4px] p-3 min-h-[120px]" style={{ borderColor: 'var(--border-main)', background: 'var(--surface-muted)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-2 text-text-main">
                Description
              </p>
              <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap text-text-main">
                {item?.description || 'No description provided.'}
              </p>
            </div>

            {error && (
              <p className="text-xs font-black uppercase mt-3" style={{ color: '#FF2D55' }}>
                {error}
              </p>
            )}

            <div className="mt-auto pt-4">
              <button
                id={`claim-${item?.id}`}
                type="button"
                onClick={handleClaim}
                disabled={claiming || item?.is_sold}
                className="w-full border-[4px] py-4 px-4 text-sm sm:text-base font-black uppercase tracking-wider disabled:opacity-60"
                style={{ color: 'var(--bg-main)', background: '#ff3366', borderColor: 'var(--border-main)', boxShadow: '8px 8px 0px 0px var(--shadow-hard)' }}
              >
                {item?.is_sold ? 'Already Sold' : claiming ? 'Claiming...' : 'Claim on WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
