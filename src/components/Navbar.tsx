import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
  }`

export function Navbar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold tracking-tight">TuCloset</span>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Closet
          </NavLink>
          <NavLink to="/add" className={linkClass}>
            Agregar
          </NavLink>
          <NavLink to="/outfits" className={linkClass}>
            Outfits
          </NavLink>
          <button
            onClick={handleSignOut}
            className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
