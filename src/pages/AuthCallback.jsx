import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const SUPPORTED_OTP_TYPES = new Set([
  'magiclink',
  'recovery',
  'invite',
  'email',
  'email_change',
])

export default function AuthCallback() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Completing sign-in...')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    const completeAuth = async () => {
      try {
        const url = new URL(window.location.href)
        const hashParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : '')
        const searchParams = url.searchParams

        const authError =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error')

        if (authError) {
          throw new Error(decodeURIComponent(authError.replace(/\+/g, ' ')))
        }

        const code = searchParams.get('code')
        const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash')
        const otpType = searchParams.get('type') || hashParams.get('type')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else if (tokenHash && otpType) {
          if (!SUPPORTED_OTP_TYPES.has(otpType)) {
            throw new Error('Unsupported login token type received.')
          }

          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          })
          if (error) throw error
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('Could not create session from the email link. Please request a new magic link.')
        }

        if (!active) return
        setStatus('success')
        setMessage('Sign-in successful. Redirecting...')
        navigate('/', { replace: true })
      } catch (error) {
        if (!active) return
        setStatus('error')
        setMessage(error.message || 'Magic link could not be verified. Please try again.')
      }
    }

    completeAuth()

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <main className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="card w-full max-w-md p-8 text-center space-y-4">
        <p className="text-4xl">{status === 'error' ? '⚠️' : '⚡'}</p>
        <h1 className="text-xl font-black text-text-main">
          {status === 'error' ? 'Login failed' : 'Authenticating'}
        </h1>
        <p className="text-sm font-semibold" style={{ color: status === 'error' ? '#FF2D55' : 'var(--text-muted)' }}>
          {message}
        </p>
        {status === 'error' && (
          <Link to="/login" className="btn-primary inline-block">
            Back to Login
          </Link>
        )}
      </div>
    </main>
  )
}
