import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import API from '../services/api'

type PasswordResetProps = { role: 'admin' | 'teacher' | 'student' }

export default function PasswordReset({ role }: PasswordResetProps) {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const isResetPage = location.pathname === '/reset-password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [complete, setComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (isResetPage && password !== confirmation) {
      setError('The passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      if (isResetPage) {
        await API.post<{ message: string }>('/auth/reset-password', { token, password, role })
        setComplete(true)
        setPassword('')
        setConfirmation('')
        navigate('/reset-password', { replace: true })
      } else {
        const response = await API.post<{ message: string }>('/auth/forgot-password', { email, role })
        setMessage(response.data.message)
        setSent(true)
      }
    } catch (requestError) {
      const errorMessage = isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : undefined
      setError(errorMessage || 'Unable to complete the password reset request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className={`password-reset-page ${role}-password-reset`}>
      <section className="password-reset-card">
        <p className="password-reset-eyebrow">eduTrack · {role} account</p>
        {complete ? (
          <>
            <h1>Password updated</h1>
            <p className="password-reset-description">Your password has been changed. You can now sign in with your new password.</p>
            <Link className="button password-reset-submit" to="/login">Return to sign in</Link>
          </>
        ) : isResetPage && !token ? (
          <>
            <h1>Reset link unavailable</h1>
            <p className="password-reset-description">This password reset link is invalid or expired. Request a new link to continue.</p>
            <Link className="button password-reset-submit" to="/forgot-password">Request a new link</Link>
          </>
        ) : sent ? (
          <>
            <h1>Check your email</h1>
            <p className="password-reset-description" role="status">{message}</p>
            <Link className="password-reset-secondary-link" to="/login">Return to sign in</Link>
          </>
        ) : (
          <>
            <h1>{isResetPage ? 'Choose a new password' : 'Forgot your password?'}</h1>
            <p className="password-reset-description">
              {isResetPage
                ? 'Use at least 8 characters. Passwords are limited to 72 bytes.'
                : 'Enter your account email and we will send you a secure reset link.'}
            </p>
            {error && <div className="password-reset-error" role="alert">{error}</div>}
            <form className="password-reset-form" onSubmit={submit}>
              {isResetPage ? (
                <>
                  <label htmlFor="new-password">New password</label>
                  <input id="new-password" className="input" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} required />
                  <label htmlFor="confirm-password">Confirm new password</label>
                  <input id="confirm-password" className="input" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={confirmation} onChange={event => setConfirmation(event.target.value)} required />
                </>
              ) : (
                <>
                  <label htmlFor="reset-email">Email address</label>
                  <input id="reset-email" className="input" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
                </>
              )}
              <button className="button password-reset-submit" type="submit" disabled={submitting}>
                {submitting ? 'Please wait…' : isResetPage ? 'Reset password' : 'Send reset link'}
              </button>
            </form>
            <Link className="password-reset-secondary-link" to="/login">Back to sign in</Link>
          </>
        )}
      </section>
    </main>
  )
}
