import { useState, type SubmitEvent } from 'react'
import { useAuth } from './AuthProvider'

type Mode = 'sign-in' | 'sign-up'

const SIGNUP_ENABLED = import.meta.env.VITE_ENABLE_SIGNUP === 'true'

export function LoginScreen() {
  const { signInWithEmailPassword, signUpWithEmailPassword, signInWithGoogle, isLoading } =
    useAuth()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signInWithEmailPassword(email, password)
      } else {
        await signUpWithEmailPassword(email, password)
        setCheckEmail(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setSubmitting(false)
    }
  }

  const isDisabled = submitting || isLoading

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4 pb-10">
      <div className="relative w-full max-w-md pixel-border rounded-none bg-retro-dark p-6 scanlines">
        <div className="relative z-10">
          {checkEmail ? (
            <div className="py-4 text-center space-y-4">
              <h1 className="font-pixel text-base text-retro-green sm:text-lg">
                {'>'} Check your email
              </h1>
              <p className="font-body text-sm text-gray-400">
                We sent a confirmation link to <span className="text-retro-cyan">{email}</span>. Click it to activate your account.
              </p>
              <button
                type="button"
                onClick={() => { setCheckEmail(false); setMode('sign-in') }}
                className="mt-2 font-pixel text-[8px] text-gray-600 transition hover:text-retro-cyan"
              >
                {'<< back to sign in'}
              </button>
            </div>
          ) : (<>
          <h1 className="mb-1 font-pixel text-base text-retro-cyan sm:text-lg">
            {'>'} Welcome
          </h1>
          <p className="mb-6 font-body text-sm text-gray-500">
            {mode === 'sign-in'
              ? 'Sign in to your account'
              : 'Create a new account'}
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="font-pixel text-[8px] text-retro-green">
                email
              </span>
              <input
                className="w-full rounded-none border-2 border-retro-cyan/30 bg-retro-black px-3 py-2.5 font-body text-sm text-gray-100 outline-none transition placeholder:text-gray-700 focus:border-retro-cyan focus:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-60"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isDisabled}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-pixel text-[8px] text-retro-green">
                password
              </span>
              <input
                className="w-full rounded-none border-2 border-retro-cyan/30 bg-retro-black px-3 py-2.5 font-body text-sm text-gray-100 outline-none transition placeholder:text-gray-700 focus:border-retro-cyan focus:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-60"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  mode === 'sign-in' ? 'current-password' : 'new-password'
                }
                placeholder="********"
                disabled={isDisabled}
              />
            </label>

            {error && (
              <div className="pixel-border-magenta rounded-none bg-retro-dark p-2">
                <p className="font-pixel text-[8px] text-retro-red">
                  {'>>'} {error}
                </p>
              </div>
            )}

            <button
              className="pixel-btn mt-1 w-full rounded-none border-2 border-retro-cyan bg-retro-cyan/10 px-3 py-2.5 font-pixel text-[10px] text-retro-cyan shadow-pixel transition hover:bg-retro-cyan/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
              type="submit"
              disabled={isDisabled}
            >
              {mode === 'sign-in' ? '[SIGN IN]' : '[SIGN UP]'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-retro-cyan/15" />
            <span className="font-pixel text-[8px] text-gray-600">or</span>
            <span className="h-px flex-1 bg-retro-cyan/15" />
          </div>

          <button
            className="pixel-btn pixel-border-magenta w-full rounded-none bg-retro-dark px-3 py-2.5 font-pixel text-[8px] text-retro-magenta transition hover:bg-retro-magenta/10 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[10px]"
            type="button"
            onClick={handleGoogle}
            disabled={isDisabled}
          >
            [CONTINUE WITH GOOGLE]
          </button>

          {SIGNUP_ENABLED && (
            <button
              className="mt-5 w-full text-center font-body text-xs text-gray-600 transition hover:text-retro-cyan disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
              disabled={isDisabled}
            >
              {mode === 'sign-in'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          )}
          </>)}
        </div>
      </div>
    </div>
  )
}
