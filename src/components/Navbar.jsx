import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import UploadItemModal from './UploadItemModal'
import FlashDropLogo from './FlashDropLogo'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const searchToggleRef = useRef(null)
  const searchBubbleRef = useRef(null)
  const searchInputRef = useRef(null)
  const location = useLocation()
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

  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search).get('q') || ''
    setSearchInput(urlQuery)
  }, [location.search])

  useEffect(() => {
    if (location.pathname !== '/') {
      setShowSearch(false)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!showSearch) return

    const onPointerDown = event => {
      const target = event.target
      if (
        searchBubbleRef.current?.contains(target) ||
        searchToggleRef.current?.contains(target)
      ) {
        return
      }
      setShowSearch(false)
    }

    const onEscape = event => {
      if (event.key === 'Escape') {
        setShowSearch(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    window.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('keydown', onEscape)
    }
  }, [showSearch])

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus()
    }
  }, [showSearch])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const navigateToSearch = (rawValue, replace = false) => {
    const trimmed = rawValue.trim()
    const params = new URLSearchParams()
    if (trimmed) {
      params.set('q', trimmed)
    }
    navigate(
      { pathname: '/', search: params.toString() ? `?${params.toString()}` : '' },
      { replace }
    )
  }

  const handleSearchChange = e => {
    const nextValue = e.target.value
    setSearchInput(nextValue)

    if (location.pathname === '/') {
      navigateToSearch(nextValue, true)
    }
  }

  const handleSearchSubmit = e => {
    e.preventDefault()
    navigateToSearch(searchInput, location.pathname === '/')
    setShowSearch(false)
  }

  const handleSearchClear = () => {
    setSearchInput('')
    setShowSearch(false)
    navigateToSearch('', true)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b-[4px] border-border-main" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-2 sm:px-4 min-h-14 sm:h-16 flex items-center justify-between gap-2 relative">
          {/* Logo */}
          <Link to="/" className="group min-w-0">
            <FlashDropLogo />
            <span className="hidden sm:inline-flex text-xs font-black uppercase tracking-wide px-2 py-0.5 border-[4px] border-border-main ml-2 text-text-main" style={{ background: 'var(--card-main)', boxShadow: '6px 6px 0px 0px var(--shadow-hard)' }}>
              NSEC
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              id="search-toggle-btn"
              type="button"
              onClick={() => setShowSearch(prev => !prev)}
              ref={searchToggleRef}
              className="text-text-main font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)] leading-none"
              style={{ background: 'var(--card-main)' }}
              aria-label="Toggle search"
              aria-expanded={showSearch}
            >
              <span className="sm:hidden">⌕</span>
              <span className="hidden sm:inline">Search</span>
            </button>

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

          {showSearch && (
            <div
              ref={searchBubbleRef}
              className="absolute top-[calc(100%+10px)] right-0 w-[min(24rem,calc(100vw-1rem))] border-[4px] border-border-main p-3 z-50"
              style={{ background: 'var(--card-main)', boxShadow: '8px 8px 0px 0px var(--shadow-hard)' }}
            >
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <button
                  id="navbar-search-submit"
                  type="submit"
                  className="font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-2 border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)] text-bg-main"
                  style={{ background: '#ff3366' }}
                >
                  Go
                </button>
                <input
                  id="navbar-search-input"
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search listings..."
                  className="input-field !py-2 !px-3 text-sm flex-1 min-w-0"
                />
                <button
                  id="navbar-search-clear"
                  type="button"
                  onClick={handleSearchClear}
                  className="font-black uppercase tracking-wide text-[10px] sm:text-xs px-2 sm:px-3 py-2 border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)] text-text-main"
                  style={{ background: 'var(--card-main)' }}
                >
                  Clear
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {showModal && <UploadItemModal onClose={() => setShowModal(false)} />}
    </>
  )
}
