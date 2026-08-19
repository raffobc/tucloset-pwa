import type { ClothingItem } from '../types'

const categoryLabels: Record<ClothingItem['category'], string> = {
  top: 'Parte superior',
  bottom: 'Parte inferior',
  dress: 'Vestido',
  outerwear: 'Abrigo',
  shoes: 'Calzado',
  accessory: 'Accesorio',
  other: 'Otro',
}

interface ItemCardProps {
  item: ClothingItem
  selected?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export function ItemCard({ item, selected, onClick, onDelete }: ItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border bg-slate-900 transition-all ${
        selected ? 'border-sky-500 ring-2 ring-sky-500/50' : 'border-slate-800'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="aspect-square w-full bg-slate-800">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600 text-sm">
            Sin foto
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate font-medium text-sm">{item.name}</p>
        <p className="text-xs text-slate-400">
          {categoryLabels[item.category]} · {item.season}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
        >
          Eliminar
        </button>
      )}
    </div>
  )
}
