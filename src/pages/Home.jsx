import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { supabase } from '../lib/supabase'
import ItemGrid from '../components/ItemGrid'
import CategoryFilter from '../components/CategoryFilter'
import FlashDropLogo from '../components/FlashDropLogo'

export default function Home() {
  const [category, setCategory] = useState('All')
  const [user, setUser] = useState(null)
  const [savedCount, setSavedCount] = useState(0)
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').trim()
  const { items, loading, error } = useItems(category, searchQuery)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true

    const fetchSavedCount = async () => {
      const { count, error: countError } = await supabase
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('is_sold', true)

      if (!active) return

      if (countError) {
        console.error('Failed to fetch impact count:', countError.message)
        return
      }

      setSavedCount(count || 0)
    }

    fetchSavedCount()

    const impactChannel = supabase
      .channel('impact-counter')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, fetchSavedCount)
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(impactChannel)
    }
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Section - Neo-Brutalist */}
      <div 
        className="text-center py-16 px-6 space-y-6 border-[4px] border-border-main relative bg-bg-main"
        style={{ boxShadow: 'var(--shadow-brutal)', background: 'var(--card-main)' }}
      >
        <div className="absolute -top-4 -right-4 bg-[#FFCC00] text-black font-black uppercase text-xs px-3 py-1 border-[4px] border-black transform rotate-12 shadow-[6px_6px_0px_0px_var(--shadow-hard)]">
          Beta
        </div>

        <h1>
          <FlashDropLogo size="hero" />
        </h1>
        
        <p className="text-lg md:text-2xl max-w-2xl mx-auto font-bold text-text-main">
          Buy &amp; sell campus stuff before the semester ends. <br className="hidden md:block"/>Ticking clocks, zero middlemen.
        </p>

        {/* Impact counter */}
        {savedCount > 0 && (
          <div
            className="inline-flex items-center gap-2 border-[4px] border-border-main px-5 py-3 mt-4 text-sm md:text-base font-black uppercase tracking-wider shadow-[6px_6px_0px_0px_var(--shadow-hard)] transform -rotate-1 transition-transform hover:rotate-0"
            style={{ background: 'var(--impact-bg)', color: 'var(--impact-text)' }}
          >
            🌱 {savedCount} item{savedCount !== 1 ? 's' : ''} saved from the landfill this semester
          </div>
        )}

        {!user && (
          <div className="mt-8 pt-6 border-t-[4px] border-dashed border-border-main">
            <p className="text-base font-bold text-text-main uppercase tracking-wide">
              Browse freely — sign in with your NSEC email to buy or sell.
            </p>
          </div>
        )}
      </div>

      {/* Category filter */}
      <CategoryFilter selected={category} onSelect={setCategory} />

      {searchQuery && (
        <div
          className="inline-flex items-center gap-2 border-[4px] border-border-main px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider"
          style={{ background: 'var(--card-main)', boxShadow: '6px 6px 0px 0px var(--shadow-hard)' }}
        >
          Results for: <span className="text-flash-pink">{searchQuery}</span>
        </div>
      )}

      {/* Grid */}
      <ItemGrid items={items} loading={loading} error={error} currentUser={user} />
    </main>
  )
}
