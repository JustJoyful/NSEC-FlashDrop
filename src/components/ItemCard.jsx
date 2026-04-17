import CountdownTimer from './CountdownTimer'
import FomoBadge from './FomoBadge'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CONDITION_COLORS = {
  'Like New': 'text-available',
  'Good': 'text-yellow-400',
  'Fair': 'text-orange-400',
}

const CATEGORY_EMOJI = {
  'Books': '📚',
  'Electronics': '💻',
  'Clothing': '👕',
  'Furniture': '🪑',
  'Other': '📦',
}

/**
 * Opens WhatsApp with a pre-filled message to the seller.
 */
function openWhatsApp(sellerPhone, itemTitle, price) {
  const message = encodeURIComponent(
    `Hi! I saw your listing on NSEC FlashDrop — *${itemTitle}* for ₹${price}. Is it still available? I can come pick it up today!`
  )
  window.open(`https://wa.me/${sellerPhone}?text=${message}`, '_blank')
}

export default function ItemCard({ item, currentUser }) {
  const [registering, setRegistering] = useState(false)
  const [actionError, setActionError] = useState('')
  const navigate = useNavigate()

  const handleIWantThis = async () => {
    setActionError('')

    if (!item.seller_whatsapp) {
      setActionError('Seller WhatsApp number is missing for this listing.')
      return
    }

    if (!currentUser) {
      setActionError('Sign in with your NSEC email to message sellers.')
      navigate('/login')
      return
    }

    // Register interest in Supabase if logged in
    setRegistering(true)
    try {
      const { data: insertedRows, error: interestError } = await supabase
        .from('interest_clicks')
        .upsert(
          { item_id: item.id, user_id: currentUser.id },
          { onConflict: 'item_id,user_id', ignoreDuplicates: true }
        )
        .select('id')

      if (interestError) {
        throw interestError
      }

      if (insertedRows?.length) {
        const { error: rpcError } = await supabase.rpc('increment_interest', { item_id: item.id })
        if (rpcError) {
          throw rpcError
        }
      }
    } catch (error) {
      setActionError(error.message || 'Could not update interest count.')
    } finally {
      setRegistering(false)
    }

    openWhatsApp(item.seller_whatsapp, item.title, item.price)
  }

  return (
    <div id={`item-${item.id}`} className="card flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden border-b-[3px] border-[var(--color-border)] aspect-[4/3]" style={{ background: 'var(--color-surface-muted)' }}>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {CATEGORY_EMOJI[item.category] || '📦'}
          </div>
        )}

        {/* Sold overlay */}
        {item.is_sold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="bg-[#111111] text-white border-[3px] border-[#111111] px-4 py-2 font-black text-2xl tracking-widest transform -rotate-12 shadow-[4px_4px_0px_0px_#111111]">SOLD</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-black uppercase tracking-wide px-2 py-1"
            style={{ color: 'var(--color-text)', background: 'var(--color-card)', border: '3px solid var(--color-border)', boxShadow: '3px 3px 0px 0px var(--color-border)' }}>
            {CATEGORY_EMOJI[item.category]} {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2" style={{ background: 'var(--color-card)' }}>
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-base leading-tight line-clamp-2" style={{ color: 'var(--color-text)' }}>
            {item.title}
          </h3>
          <span className="font-black text-lg whitespace-nowrap bg-[#FFFFA5] px-2 py-0.5 border-[3px] border-[var(--color-border)] shadow-[2px_2px_0px_0px_var(--color-border)] transform rotate-2">
            ₹{item.price}
          </span>
        </div>

        {/* Condition + Seller */}
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
          <span className={`${CONDITION_COLORS[item.condition] || 'text-gray-600'} uppercase tracking-wide`}>
            {item.condition}
          </span>
          <span>·</span>
          <span className="uppercase tracking-wide">{item.seller_name}</span>
        </div>

        {/* FOMO Badge */}
        {item.interested_count > 0 && (
          <FomoBadge count={item.interested_count} />
        )}

        {/* Countdown */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t-[3px] border-dashed border-[var(--color-border)]">
          <CountdownTimer expiresAt={item.expires_at} />

          {!item.is_sold && (
            <div className="flex flex-col items-end gap-1">
              <button
                id={`want-${item.id}`}
                onClick={handleIWantThis}
                disabled={registering}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-60"
              >
                {registering ? '...' : '💬 I Want This'}
              </button>
              {actionError && (
                <span className="text-[10px] font-semibold text-right max-w-[140px]" style={{ color: 'var(--color-fomo)' }}>
                  {actionError}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
