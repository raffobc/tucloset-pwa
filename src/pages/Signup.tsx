import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setInfo('Cuenta creada. Si tu proyecto de Supabase requiere confirmación por email, revisa tu bandeja de entrada.')
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-400">Empieza a organizar tu closet</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-950/50 border border-red-900 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg bg-emerald-950/50 border border-emerald-900 px-3 py-2 text-sm text-emerald-300">
            {info}
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
            minLength={6}
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
          {loading ? 'Creando…' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-sky-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}
