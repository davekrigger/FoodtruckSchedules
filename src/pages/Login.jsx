import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } }
      })

      if (error) {
        setError(error.message)
      } else {
        // Create profile row
        await supabase.from('profiles').insert({ id: data.user.id, email, role })
        setMessage('Account created! Check your email to confirm, then log in.')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'operator') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      }
    }

    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem 1rem' }}>
      <h1>{isSignUp ? 'Create Account' : 'Log In'}</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
        />

        {isSignUp && (
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' }}
          >
            <option value="user">I want to find food trucks</option>
            <option value="operator">I operate a food truck</option>
          </select>
        )}

        {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        {message && <p style={{ color: 'green', margin: 0 }}>{message}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '6px', backgroundColor: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
          style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignUp ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}
