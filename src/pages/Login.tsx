import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">TuCloset</h1>
          <p className="mt-1 text-sm text-slate-400">Inicia sesión en tu closet</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-950/50 border border-red-900 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link to="/signup" className="text-sky-400 hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}
