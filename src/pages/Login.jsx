import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const appUrl = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/+$/, '')
  const redirectUrl = `${appUrl}/auth/callback`
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/', { replace: true })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [navigate])

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail.endsWith('@nsec.ac.in')) {
      setError('⚠️ Only @nsec.ac.in email addresses can sign in.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: redirectUrl },
    })
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setEmail(normalizedEmail)
      setSent(true)
    }
  }

  return (
    <main className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="card w-full max-w-sm p-8 space-y-6">
        {!sent ? (
          <>
            <div className="text-center space-y-1">
              <span className="text-4xl">⚡</span>
              <h1 className="text-2xl font-black text-text-main">Sign In</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Use your NSEC email to buy or sell items.
              </p>
            </div>

            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                  NSEC Email
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="yourname@nsec.ac.in"
                  className="input-field"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm font-semibold text-fomo">{error}</p>
              )}

              <button id="send-magic-link-btn" type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
                {loading ? 'Sending...' : '✉️ Send Magic Link'}
              </button>
            </form>

            <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              We&apos;ll send a login link to your inbox. No password needed.
            </p>
          </>
        ) : (
          <div className="text-center space-y-4">
            <span className="text-5xl">📬</span>
            <h2 className="text-xl font-black text-text-main">Check your inbox!</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              We sent a magic link to <strong className="text-flash-pink">{email}</strong>.
              <br />Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-ghost w-full"
            >
              ← Back to FlashDrop
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
