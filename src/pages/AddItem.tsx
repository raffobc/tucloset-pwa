import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import type { Category, Season } from '../types'

const categories: { value: Category; label: string }[] = [
  { value: 'top', label: 'Parte superior' },
  { value: 'bottom', label: 'Parte inferior' },
  { value: 'dress', label: 'Vestido' },
  { value: 'outerwear', label: 'Abrigo' },
  { value: 'shoes', label: 'Calzado' },
  { value: 'accessory', label: 'Accesorio' },
  { value: 'other', label: 'Otro' },
]

const seasons: Season[] = ['todo el año', 'verano', 'otoño', 'invierno', 'primavera']

export function AddItem() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('top')
  const [color, setColor] = useState('')
  const [season, setSeason] = useState<Season>('todo el año')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (f: File | null) => {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      let image_url: string | null = null

      if (file) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('closet-photos').upload(path, file)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('closet-photos').getPublicUrl(path)
        image_url = data.publicUrl
      }

      const { error: insertError } = await supabase.from('items').insert({
        user_id: user.id,
        name,
        category,
        color: color || null,
        season,
        notes: notes || null,
        image_url,
      })
      if (insertError) throw insertError

      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar la prenda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h2 className="mb-4 text-xl font-semibold">Agregar prenda</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-red-950/50 border border-red-900 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div>
          <label className="mb-1 block text-sm text-slate-300">Foto</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:text-slate-200"
          />
          {preview && (
            <img src={preview} alt="preview" className="mt-3 h-40 w-40 rounded-lg object-cover" />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Nombre</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Camisa a rayas"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Temporada</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value as Season)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
            >
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Color</label>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Ej. Azul"
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {loading ? 'Guardando…' : 'Guardar prenda'}
        </button>
      </form>
    </div>
  )
}
