# TuCloset

PWA para organizar tu closet personal: sube tus prendas, filtra por categoría/temporada y arma outfits.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- React Router
- Supabase (auth + base de datos + storage de fotos)
- vite-plugin-pwa (instalable, funciona offline)

## Poner en marcha

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea un proyecto en [supabase.com](https://supabase.com) (gratis).

3. En el SQL Editor de tu proyecto, ejecuta el contenido de `supabase/schema.sql`. Esto crea las tablas `items`, `outfits`, `outfit_items`, las políticas de seguridad (RLS) y el bucket de storage `closet-photos` para las fotos.

4. Copia `.env.example` a `.env.local` y completa con los datos de tu proyecto (Settings > API):

   ```bash
   cp .env.example .env.local
   ```

5. Corre en desarrollo:

   ```bash
   npm run dev
   ```

6. Build de producción:

   ```bash
   npm run build
   npm run preview
   ```

## Estructura

```
src/
  contexts/AuthContext.tsx   # sesión y métodos de login/signup/logout
  lib/supabaseClient.ts      # cliente de Supabase
  components/                # Navbar, ItemCard, ProtectedRoute
  pages/                     # Login, Signup, Closet, AddItem, Outfits
  types/                     # tipos compartidos
supabase/schema.sql          # tablas, RLS y bucket de storage
```

## Funcionalidad actual (MVP)

- Registro / login con email y contraseña
- Agregar prenda (foto, nombre, categoría, color, temporada, notas)
- Listado del closet con filtro por categoría
- Armar outfits seleccionando varias prendas
- Cada usuario solo ve y edita sus propias prendas/outfits (RLS)
- Instalable como PWA (manifest + service worker)

## Próximos pasos sugeridos

- Editar/actualizar una prenda existente
- Búsqueda por texto y filtro por temporada/color
- Compartir un outfit (enlace público)
- Recorte/compresión de imágenes antes de subir
- Modo oscuro/claro configurable (hoy es oscuro por defecto)
