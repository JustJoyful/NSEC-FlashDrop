import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ListItemModal from './ListItemModal'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'var(--color-nav-bg)', borderColor: 'var(--color-border)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4 min-h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
            <span className="text-lg sm:text-2xl">⚡</span>
            <span className="text-sm sm:text-xl font-black tracking-tight truncate" style={{ color: 'var(--color-text)' }}>
              Flash<span style={{ color: 'var(--color-accent)' }}>Drop</span>
            </span>
            <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border ml-1" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)', fontSize: '10px' }}>
              NSEC
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {!authReady ? (
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                Loading...
              </span>
            ) : user ? (
              <>
                <button
                  id="sell-btn"
                  onClick={() => setShowModal(true)}
                  className="bg-accent text-[var(--color-bg)] font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[3px] border-[var(--color-border)] shadow-[3px_3px_0px_0px_var(--color-border)] leading-none"
                >
                  <span className="sm:hidden">Sell</span>
                  <span className="hidden sm:inline">+ Sell My Stuff</span>
                </button>
                <Link to="/my-listings" className="text-[var(--color-text)] font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[3px] border-[var(--color-border)] shadow-[3px_3px_0px_0px_var(--color-border)] leading-none" style={{ background: 'var(--color-card)' }}>
                  <span className="sm:hidden">My</span>
                  <span className="hidden sm:inline">My Listings</span>
                </Link>
                <button onClick={handleLogout} className="text-[10px] sm:text-xs font-black uppercase tracking-wide px-1 sm:px-2" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="sm:hidden">⎋</span>
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <Link to="/login" id="login-btn" className="bg-accent text-[var(--color-bg)] font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[3px] border-[var(--color-border)] shadow-[3px_3px_0px_0px_var(--color-border)] leading-none">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showModal && <ListItemModal onClose={() => setShowModal(false)} />}
    </>
  )
}
