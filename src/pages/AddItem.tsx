import { useRef, useState, type FormEvent } from 'react'
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
  const [file, setFile] = useState<File | Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [removingBg, setRemovingBg] = useState(false)
  const [bgRemoved, setBgRemoved] = useState(false)
  const [bgProgress, setBgProgress] = useState<string | null>(null)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
    setBgRemoved(false)
  }

  const handleRemoveBackground = async () => {
    if (!file) return
    setRemovingBg(true)
    setBgProgress('Cargando modelo…')
    setError(null)

    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const resultBlob = await removeBackground(file, {
        // Modelo cuantizado (~40MB) en vez del default (~80MB): más liviano para descargar en el celular.
        model: 'isnet_quint8',
        progress: (_key, current, total) => {
          setBgProgress(total ? `Descargando modelo… ${Math.round((current / total) * 100)}%` : 'Procesando…')
        },
      })
      setFile(resultBlob)
      setPreview(URL.createObjectURL(resultBlob))
      setBgRemoved(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo quitar el fondo: ${err.message}`
          : 'No se pudo quitar el fondo de la imagen'
      )
    } finally {
      setRemovingBg(false)
      setBgProgress(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      let image_url: string | null = null

      if (file) {
        const ext = bgRemoved ? 'png' : file instanceof File ? file.name.split('.').pop() : 'png'
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

          {/* Input oculto para cámara: capture="environment" abre la cámara trasera directo en móviles */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {/* Input oculto para galería: sin capture, abre el selector de archivos/fotos */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              📷 Tomar foto
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              🖼️ Elegir de galería
            </button>
          </div>

          {preview && (
            <div className="mt-3 space-y-2">
              <div
                className="h-40 w-40 overflow-hidden rounded-lg border border-slate-800"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}
              >
                <img src={preview} alt="preview" className="h-full w-full object-contain" />
              </div>

              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={removingBg || bgRemoved}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-60"
              >
                {removingBg
                  ? bgProgress ?? 'Procesando…'
                  : bgRemoved
                    ? '✓ Fondo eliminado'
                    : '✨ Quitar fondo'}
              </button>
              {!bgRemoved && !removingBg && (
                <p className="text-xs text-slate-500">
                  La primera vez descarga un modelo de IA (~40MB) en el navegador — mejor con WiFi. Las
                  siguientes veces es rápido porque queda en caché.
                </p>
              )}
            </div>
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
