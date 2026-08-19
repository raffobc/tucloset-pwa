export type Category =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessory'
  | 'other'

export type Season = 'verano' | 'otoño' | 'invierno' | 'primavera' | 'todo el año'

export interface ClothingItem {
  id: string
  user_id: string
  name: string
  category: Category
  color: string | null
  season: Season
  image_url: string | null
  notes: string | null
  created_at: string
}

export interface Outfit {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface OutfitItem {
  id: string
  outfit_id: string
  item_id: string
}

export interface OutfitWithItems extends Outfit {
  items: ClothingItem[]
}
