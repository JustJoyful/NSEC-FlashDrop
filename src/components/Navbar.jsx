import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import UploadItemModal from './UploadItemModal'
import FlashDropLogo from './FlashDropLogo'

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
      <nav className="sticky top-0 z-50 border-b border-border-main" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4 min-h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="group min-w-0">
            <FlashDropLogo />
            <span className="hidden sm:inline-flex text-xs font-black uppercase tracking-wide px-2 py-0.5 border-[4px] border-border-main ml-2 text-text-main" style={{ background: 'var(--card-main)', boxShadow: '6px 6px 0px 0px var(--shadow-hard)' }}>
              NSEC
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {!authReady ? (
              <span className="text-xs font-black uppercase text-text-main">
                Loading...
              </span>
            ) : user ? (
              <>
                <button
                  id="sell-btn"
                  onClick={() => setShowModal(true)}
                  className="text-bg-main font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)] leading-none"
                  style={{ background: '#ff3366' }}
                >
                  <span className="sm:hidden">Sell</span>
                  <span className="hidden sm:inline">+ Sell My Stuff</span>
                </button>
                <Link to="/my-listings" className="text-text-main font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)] leading-none" style={{ background: 'var(--card-main)' }}>
                  <span className="sm:hidden">My</span>
                  <span className="hidden sm:inline">My Listings</span>
                </Link>
                <button onClick={handleLogout} className="text-[10px] sm:text-xs font-black uppercase tracking-wide px-1 sm:px-2 text-text-main">
                  <span className="sm:hidden">⎋</span>
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <Link to="/login" id="login-btn" className="text-bg-main font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)] leading-none" style={{ background: '#ff3366' }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {showModal && <UploadItemModal onClose={() => setShowModal(false)} />}
    </>
  )
}
