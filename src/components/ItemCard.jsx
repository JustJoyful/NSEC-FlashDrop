import { useState } from 'react'
import ListItemModal from './ListItemModal'
import CountdownTimer from './CountdownTimer'
import FomoBadge from './FomoBadge'
import { getPrimaryImage, getSellerUsername } from '../lib/itemMedia'

const CATEGORY_EMOJI = {
  'Books': '📚',
  'Electronics': '💻',
  'Clothing': '👕',
  'Furniture': '🪑',
  'Other': '📦',
}

const CONDITION_STYLES = {
  'Like New': { background: '#B8F7CF', color: '#0D3B1F' },
  'Good': { background: '#FFE28A', color: '#3D2A00' },
  'Fair': { background: '#FFD1B0', color: '#4A2100' },
}

export default function ItemCard({ item, currentUser }) {
  const [showDetails, setShowDetails] = useState(false)
  const primaryImage = getPrimaryImage(item)
  const sellerUsername = getSellerUsername(item)
  const conditionStyle = CONDITION_STYLES[item.condition] || { background: 'var(--surface-muted)', color: 'var(--text-main)' }

  return (
    <>
      <button
        type="button"
        id={`item-${item.id}`}
        onClick={() => setShowDetails(true)}
        className="group card w-full text-left overflow-hidden transition-all duration-300 border-[4px]"
        style={{ borderColor: 'var(--border-main)', boxShadow: '8px 8px 0px 0px var(--shadow-hard)' }}
      >
        <div className="relative overflow-hidden border-b-[4px] aspect-[4/3]" style={{ background: 'var(--surface-muted)', borderColor: 'var(--border-main)' }}>
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {CATEGORY_EMOJI[item.category] || '📦'}
            </div>
          )}

          {item.is_sold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="px-4 py-2 font-black text-2xl tracking-widest transform -rotate-12 border-[4px] shadow-[6px_6px_0px_0px_var(--shadow-hard)]" style={{ background: 'var(--text-main)', color: 'var(--bg-main)', borderColor: 'var(--text-main)' }}>SOLD</span>
            </div>
          )}

          <div className="absolute top-2 left-2">
            <span
              className="text-[10px] sm:text-xs font-black uppercase tracking-wide px-2 py-1 border-[4px]"
              style={{ color: 'var(--text-main)', background: 'var(--card-main)', borderColor: 'var(--border-main)', boxShadow: '4px 4px 0px 0px var(--shadow-hard)' }}
            >
              {CATEGORY_EMOJI[item.category]} {item.category}
            </span>
          </div>
        </div>

        <div className="p-4" style={{ background: 'var(--card-main)' }}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-base leading-tight line-clamp-2 uppercase text-text-main">
              {item.title}
            </h3>
            <span
              className="font-black text-lg whitespace-nowrap px-2 py-0.5 border-[4px] transform rotate-1"
              style={{ background: 'var(--color-price-bg)', color: 'var(--color-price-text)', borderColor: 'var(--color-border)', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
            >
              ₹{item.price}
            </span>
          </div>

          {item.condition && (
            <div className="mt-2">
              <span
                className="inline-flex items-center px-2 py-1 border-[4px] text-[10px] sm:text-xs font-black uppercase tracking-wide"
                style={{
                  background: conditionStyle.background,
                  color: conditionStyle.color,
                  borderColor: 'var(--border-main)',
                  boxShadow: '4px 4px 0px 0px var(--shadow-hard)',
                }}
              >
                Condition: {item.condition}
              </span>
            </div>
          )}

          {item.expires_at && (
            <div className="mt-2">
              <CountdownTimer expiresAt={item.expires_at} />
            </div>
          )}

          <div className="mt-2">
            <FomoBadge count={item.interested_count} />
          </div>

          <div className="hidden md:block max-h-0 opacity-0 overflow-hidden transition-all duration-300 group-hover:max-h-28 group-hover:opacity-100">
            <div className="mt-3 pt-3 border-t-[4px]" style={{ borderColor: 'var(--border-main)' }}>
              <p className="text-xs font-bold uppercase line-clamp-2 text-text-main">
                {item.description || 'No description provided.'}
              </p>
              <p className="text-xs font-black uppercase mt-2 text-text-main">
                Seller: {sellerUsername}
              </p>
            </div>
          </div>
        </div>
      </button>

      {showDetails && (
        <ListItemModal
          item={item}
          currentUser={currentUser}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  )
}
