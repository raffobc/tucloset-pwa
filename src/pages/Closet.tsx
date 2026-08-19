import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { ItemCard } from '../components/ItemCard'
import type { Category, ClothingItem } from '../types'

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'top', label: 'Parte superior' },
  { value: 'bottom', label: 'Parte inferior' },
  { value: 'dress', label: 'Vestido' },
  { value: 'outerwear', label: 'Abrigo' },
  { value: 'shoes', label: 'Calzado' },
  { value: 'accessory', label: 'Accesorio' },
  { value: 'other', label: 'Otro' },
]

export function Closet() {
  const { user } = useAuth()
  const [items, setItems] = useState<ClothingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Category | 'all'>('all')

  useEffect(() => {
    if (!user) return
    let active = true

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return
      if (error) setError(error.message)
      else setItems(data as ClothingItem[])
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [user])

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  )

  const handleDelete = async (id: string) => {
    const prev = items
    setItems((cur) => cur.filter((i) => i.id !== id))
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setItems(prev)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mi closet</h2>
        <span className="text-sm text-slate-400">{items.length} prendas</span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === c.value
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-950/50 border border-red-900 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-400">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-400">
          Todavía no tienes prendas aquí. Ve a "Agregar" para subir la primera.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
