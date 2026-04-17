import { useState, useEffect } from 'react'
import { useItems } from '../hooks/useItems'
import { supabase } from '../lib/supabase'
import ItemGrid from '../components/ItemGrid'
import CategoryFilter from '../components/CategoryFilter'

export default function Home() {
  const [category, setCategory] = useState('All')
  const [user, setUser] = useState(null)
  const { items, loading, error } = useItems(category)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Count saved items for the impact counter
  const savedCount = items.length

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section - Neo-Brutalist */}
      <div 
        className="text-center py-16 px-6 space-y-6 border-[3px] border-[var(--color-border)] relative"
        style={{ boxShadow: 'var(--shadow-brutal)', background: 'var(--color-card)' }}
      >
        <div className="absolute -top-4 -right-4 bg-[#FFCC00] text-black font-black uppercase text-xs px-3 py-1 border-[3px] border-black transform rotate-12 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          Beta
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-[var(--color-text)]">
          ⚡ Flash<span className="inline-block bg-accent text-white px-2 border-[3px] border-[var(--color-border)] transform -rotate-2 ml-1 shadow-[4px_4px_0px_0px_var(--color-border)]">Drop</span>
        </h1>
        
        <p className="text-lg md:text-2xl max-w-2xl mx-auto font-bold text-[var(--color-text)]">
          Buy &amp; sell campus stuff before the semester ends. <br className="hidden md:block"/>Ticking clocks, zero middlemen.
        </p>

        {/* Impact counter */}
        {savedCount > 0 && (
          <div className="inline-flex items-center gap-2 border-[3px] border-[var(--color-border)] bg-available text-[var(--color-text)] px-5 py-3 mt-4 text-sm md:text-base font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_var(--color-border)] transform -rotate-1 transition-transform hover:rotate-0">
            🌱 {savedCount} item{savedCount !== 1 ? 's' : ''} saved from the landfill this semester
          </div>
        )}

        {!user && (
          <div className="mt-8 pt-6 border-t-[3px] border-dashed border-[var(--color-border)]">
            <p className="text-base font-bold text-[var(--color-text-muted)] uppercase tracking-wide">
              Browse freely — sign in with your NSEC email to buy or sell.
            </p>
          </div>
        )}
      </div>

      {/* Category filter */}
      <CategoryFilter selected={category} onSelect={setCategory} />

      {/* Grid */}
      <ItemGrid items={items} loading={loading} error={error} currentUser={user} />
    </main>
  )
}
