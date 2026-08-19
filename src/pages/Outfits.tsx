import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { ItemCard } from '../components/ItemCard'
import type { ClothingItem, OutfitWithItems } from '../types'

export function Outfits() {
  const { user } = useAuth()
  const [items, setItems] = useState<ClothingItem[]>([])
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const { data: itemsData, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (itemsError) {
      setError(itemsError.message)
      setLoading(false)
      return
    }
    setItems(itemsData as ClothingItem[])

    const { data: outfitsData, error: outfitsError } = await supabase
      .from('outfits')
      .select('*, outfit_items(item_id, items(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (outfitsError) {
      setError(outfitsError.message)
      setLoading(false)
      return
    }

    type OutfitRow = {
      id: string
      user_id: string
      name: string
      created_at: string
      outfit_items: { item_id: string; items: ClothingItem | null }[]
    }

    const mapped: OutfitWithItems[] = (outfitsData as OutfitRow[]).map((o) => ({
      id: o.id,
      user_id: o.user_id,
      name: o.name,
      created_at: o.created_at,
      items: o.outfit_items.map((oi) => oi.items).filter((i): i is ClothingItem => Boolean(i)),
    }))
    setOutfits(mapped)
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const toggleSelect = (id: string) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || selected.length === 0) return
    setSaving(true)
    setError(null)

    try {
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({ user_id: user.id, name })
        .select()
        .single()
      if (outfitError) throw outfitError

      const rows = selected.map((item_id) => ({ outfit_id: outfit.id, item_id }))
      const { error: linkError } = await supabase.from('outfit_items').insert(rows)
      if (linkError) throw linkError

      setName('')
      setSelected([])
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al crear el outfit')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteOutfit = async (id: string) => {
    const prev = outfits
    setOutfits((cur) => cur.filter((o) => o.id !== id))
    const { error } = await supabase.from('outfits').delete().eq('id', id)
    if (error) {
      setError(error.message)
      setOutfits(prev)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold">Armar outfit</h2>

      {error && (
        <p className="mb-4 rounded-lg bg-red-950/50 border border-red-900 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleCreate} className="mb-8 space-y-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del outfit (ej. Casual viernes)"
          className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />

        {loading ? (
          <p className="text-slate-400 text-sm">Cargando prendas…</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400 text-sm">Agrega prendas a tu closet primero.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                selected={selected.includes(item.id)}
                onClick={() => toggleSelect(item.id)}
              />
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || selected.length === 0}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {saving ? 'Guardando…' : `Guardar outfit (${selected.length} prendas)`}
        </button>
      </form>

      <h2 className="mb-4 text-xl font-semibold">Mis outfits</h2>
      {outfits.length === 0 ? (
        <p className="text-slate-400 text-sm">Todavía no has armado ningún outfit.</p>
      ) : (
        <div className="space-y-6">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="rounded-xl border border-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">{outfit.name}</h3>
                <button
                  onClick={() => handleDeleteOutfit(outfit.id)}
                  className="text-xs text-slate-400 hover:text-red-400"
                >
                  Eliminar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {outfit.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
