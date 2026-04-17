import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import MyListings from './pages/MyListings'
import AuthCallback from './pages/AuthCallback'

const THEME_KEY = 'flashdrop-theme'

function getInitialTheme() {
  const savedTheme = window.localStorage.getItem(THEME_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg-main text-text-main">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/my-listings" element={<MyListings />} />
        </Routes>
        <button
          id="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="fixed right-3 bottom-3 sm:right-5 sm:bottom-5 z-50 border-[4px] border-border-main px-3 py-2 font-black text-xs uppercase tracking-wide transition-transform hover:-translate-y-0.5 bg-bg-main text-text-main shadow-[8px_8px_0px_0px_var(--shadow-hard)]"
          style={{
            background: 'var(--card-main)',
          }}
        >
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>
    </BrowserRouter>
  )
}

export default App
