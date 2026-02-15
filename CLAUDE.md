# JEC HUB - Proyecto de Gestion Musical

App web para la iglesia "Jesus Es El Camino" (JEC). Gestiona canciones con chord charts, programas de culto, y equipo de musica.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL, Auth, Storage)
- **AI**: Gemini (gratis, default) + Claude API (premium, backup) para OCR de chord charts
- **Drag & Drop**: @dnd-kit (reordenamiento de canciones en setlists)
- **Deploy**: Vercel (https://jec-hub.vercel.app)
- **Repo**: https://github.com/cmastrop/jec-hub

## Estructura del Proyecto

```
src/
  app/
    (auth)/              # Layout de autenticacion (login/registro)
      layout.tsx         # Split layout con imagen de adoracion + form
      login/page.tsx     # Pagina de login
      registro/page.tsx  # Pagina de registro
    (app)/               # Layout principal con sidebar (requiere auth)
      canciones/         # Biblioteca de canciones
        [id]/page.tsx    # Vista detalle: ChordPro viewer + editor estructurado + ver original
        duplicados/      # Deteccion y gestion de canciones duplicadas (admin)
      programas/         # Programas de culto (setlists)
        page.tsx         # Lista de programas con filtros y creacion
        [id]/page.tsx    # Detalle: canciones con drag-and-drop, edicion, eliminacion
      calendario/        # Calendario conectado a programas reales
      equipo/            # Gestion de equipo y roles (admin only)
      importar/          # Pagina de importacion (upload individual + Dropbox)
      ajustes/           # Ajustes del usuario (persistidos en Supabase)
    api/
      songs/             # CRUD de canciones
        [id]/
          route.ts       # GET/PATCH/DELETE una cancion
          original/      # GET signed URL del archivo original
        import/route.ts  # POST importar archivo individual con AI
        bulk/route.ts    # PATCH publicacion/estado masivo (admin)
        duplicates/      # GET deteccion de duplicados (admin)
        route.ts         # GET lista de canciones (con filtros avanzados)
      setlists/          # CRUD de programas de culto
        route.ts         # GET lista / POST crear setlist
        [id]/
          route.ts       # GET/PATCH/DELETE setlist individual
          songs/route.ts # POST agregar / PATCH reordenar / DELETE quitar cancion
      migration/         # Migracion masiva desde Dropbox
        catalog/         # POST listar archivos Dropbox
        download/        # POST descargar archivos a Storage
        process/         # POST procesar con AI (usa abstraccion)
        status/          # GET estado de migracion
      users/             # Gestion de usuarios (admin only)
        [id]/route.ts    # PATCH rol de usuario
        route.ts         # GET lista de usuarios
      me/                # GET/PATCH perfil del usuario actual
      health/            # Health check
  components/
    song/
      chord-chart.tsx            # Renderiza ChordPro con transposicion
      structured-editor.tsx      # Editor visual por secciones (texto + visual)
      chord-position-editor.tsx  # Editor visual de posicion de acordes (mover/agregar/eliminar)
      section-header.tsx         # Header colorizado por tipo de seccion
      chord-line.tsx             # Linea de acordes + letra
      transpose-controls.tsx
      font-size-controls.tsx
      notation-toggle.tsx
    import/
      file-upload.tsx            # Componente upload con selector AI provider
    setlist/
      song-search-modal.tsx      # Modal busqueda canciones para agregar a setlist
    migration/
      dropbox-migration.tsx      # Componente migracion Dropbox
    layout/
      sidebar.tsx                # Sidebar de navegacion
      header.tsx                 # Header con menu de usuario + badge admin
    ui/                          # Componentes base (button, input, card, etc.)
  lib/
    ai/
      types.ts           # AIProvider, ExtractionResult, AIExtractor interface
      gemini-adapter.ts  # Adapter Gemini (wraps lib/gemini/extract)
      claude-adapter.ts  # Adapter Claude (Anthropic SDK)
      index.ts           # Factory getAIExtractor() + re-exports
    chordpro/
      parser.ts          # Parsea ChordPro string -> ChordProSong
      serializer.ts      # Serializa ChordProSong -> ChordPro string
      transpose.ts       # Transposicion de acordes
      chord-position.ts  # Utilidades para mover/agregar/eliminar acordes posicionalmente
      types.ts           # ChordProSong, Section, SectionType, Line, Segment
    gemini/
      client.ts          # Gemini API client (gemini-1.5-flash)
      extract.ts         # extractChordProFromImage()
      prompts.ts         # Prompts de extraccion (compartidos con Claude adapter)
    supabase/
      client.ts          # Supabase browser client
      server.ts          # Supabase server client (SSR)
      admin.ts           # Supabase admin client (service role, bypasses RLS)
    migration/
      utils.ts           # RateLimiter, getFileType, toStoragePath
    types/
      database.ts        # Song, Profile, Setlist, SetlistSong, ImportJob, etc.
  hooks/
    use-user.ts          # Hook para perfil/rol del usuario (cached, clearUserCache)
scripts/
  migrate.ts             # Script de migracion Dropbox -> Supabase (Claude API, batch)
```

## Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL       # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Clave publica Supabase
SUPABASE_SERVICE_ROLE_KEY      # Clave de servicio (bypasses RLS)
GEMINI_API_KEY                 # Google Gemini API (gratis, default)
ANTHROPIC_API_KEY              # Claude API (premium, opcional)
NEXT_PUBLIC_DROPBOX_APP_KEY    # Dropbox app key
DROPBOX_APP_SECRET             # Dropbox app secret
NEXT_PUBLIC_APP_URL            # URL de la app
CRON_SECRET                    # Secret para cron jobs
```

## Base de Datos (Supabase)

### Tabla `songs`
- `id` (uuid), `title`, `artist`, `original_key`, `chordpro_content`
- `status` ("draft" | "published" | "archived")
- `source_type` ("manual" | "import_image" | "import_pdf" | "import_dropbox")
- `original_file_url` (path en Storage bucket "originals")
- `tags` (text[]), `created_by`, `created_at`, `updated_at`

### Tabla `profiles`
- `id` (uuid, FK auth.users), `email`, `full_name`, `role` ("admin" | "member")
- `notation_preference`, `font_size_preference`

### Tabla `setlists`
- `id` (uuid), `title`, `service_type` (domingo/miercoles/jovenes/oracion/especial/otro)
- `service_date` (date), `notes`, `created_by`, `created_at`, `updated_at`

### Tabla `setlist_songs`
- `id` (uuid), `setlist_id` (FK setlists), `song_id` (FK songs)
- `position` (int, unique per setlist), `transpose_key`, `capo`, `notes`

### Storage Bucket: `originals`
- Archivos originales importados (PDFs, imagenes) desde Dropbox o upload individual

## AI Providers

Capa de abstraccion en `src/lib/ai/`:
- **Interface**: `AIExtractor { extractChordPro(buffer, mimeType) -> ExtractionResult }`
- **Factory**: `getAIExtractor(provider)` retorna Gemini o Claude adapter

### Gemini (default, gratis)
- Modelo: `gemini-1.5-flash`
- Uso: Importacion individual de archivos desde la web UI
- Free tier: suficiente para uso diario (pocas canciones)

### Claude (premium, backup)
- Modelo: `claude-sonnet-4-5-20250929`
- Uso: Migracion masiva (scripts/migrate.ts) + opcion premium en web UI
- Mejor calidad de OCR, especialmente para archivos dificiles

Ambos usan el mismo prompt de extraccion (definido en `src/lib/gemini/prompts.ts`).

## Roles y Permisos

### Administrador
Cuentas admin: `christian.mastro@gmail.com`, `musicosjesuseselcamino@gmail.com`

Permisos:
- Ver todas las canciones (publicadas y borradores)
- Crear, editar y eliminar canciones
- **Editar acordes**: reposicionar acordes con editor visual (Modo Acordes)
- **Publicacion masiva**: seleccionar multiples canciones y publicar/borrador en lote
- **Detectar duplicados**: ver y gestionar canciones con titulos similares
- Publicar canciones en borrador
- Ver archivos originales importados (split view)
- Importar canciones individuales (upload JPG/PNG/PDF + AI)
- Migrar canciones masivamente desde Dropbox
- Gestionar usuarios y roles (/equipo)
- Crear, editar y eliminar programas de culto
- Agregar/quitar/reordenar canciones en programas

### Miembro (usuario comun)
Permisos:
- Ver canciones publicadas
- Transponer tonalidad
- Cambiar tamanio de fuente
- Cambiar notacion (cifrado/solfeo) - persistido en perfil
- Ver programas de culto
- Ver calendario de servicios

## Features

### Ajustes de Usuario
- Perfil editable (nombre)
- Preferencia de notacion: cifrado (C,D,E) o solfeo (Do,Re,Mi)
- Tamanio de fuente preferido (12-32px)
- Persistido en Supabase via PATCH /api/me
- Cache invalidation con clearUserCache()

### Biblioteca de Canciones
- Busqueda por titulo/artista con debounce 300ms
- Filtro por tonalidad (badges)
- **Filtros avanzados**: artista, origen (manual/imagen/PDF/Dropbox), ordenar por (titulo/artista/fecha/key)
- Toggle borradores (admin)
- **Seleccion masiva**: modo seleccion con checkboxes, publicar/borrador en lote
- **Badge duplicados**: link a pagina de duplicados cuando existen (admin)

### Deteccion de Duplicados
- API normaliza titulos: lowercase, sin acentos, sin puntuacion
- Agrupa canciones con titulos normalizados identicos
- Pagina admin muestra grupos con todas las versiones
- Cada version: titulo real, artista, key, status, origen, fecha
- Acciones: ver cancion o eliminar duplicado

### Programas de Culto (Setlists)
- Lista de programas con filtros por tipo de servicio
- Tipos: Domingo, Miercoles, Jovenes, Oracion, Especial, Otro
- Creacion con titulo, tipo, fecha y notas
- Detalle con lista ordenada de canciones
- **Drag-and-drop** con @dnd-kit para reordenar canciones
- Modal de busqueda para agregar canciones publicadas
- Edicion y eliminacion de programa (admin o creador)

### Calendario de Servicios
- Vista mensual con navegacion (← →) y boton "Hoy"
- Conectado a datos reales de setlists via API
- Badges coloreados por tipo de servicio en cada dia
- Click en badge navega al detalle del programa
- Leyenda de colores por tipo

### Editor Estructurado
- Metadata editable (titulo, artista, tonalidad, tempo, compas)
- Secciones con tipo seleccionable (Intro, Verso, Pre-Coro, Coro, Puente, Instrumental, Outro, Tag)
- Mover secciones arriba/abajo, eliminar, renombrar
- **Modo Texto**: ChordPro textarea por seccion
- **Modo Acordes**: Editor visual de posicion de acordes por linea
- Vista previa en vivo (split view)

### Editor Visual de Acordes (Modo Acordes)
- Acordes como badges posicionados sobre letras (fuente monospace)
- Click para seleccionar, flechas para mover caracter por caracter
- Agregar/eliminar acordes, editar letra inline
- Utilidades en `src/lib/chordpro/chord-position.ts`

### Importacion Individual de Archivos
- Zona drag-and-drop en `/importar`
- Selector de provider AI: Gemini (gratis) o Claude (premium)
- Soporta: JPG, PNG, WebP, PDF (max 10MB)
- Crea borrador, redirect al editor

### Pagina de Login
- Diseno split-screen con imagen de adoracion
- Responsive (stacked en mobile, side-by-side en desktop)

## Convenios

- Idioma UI: Espanol
- Componentes: "use client" explicito, funcional con hooks
- API: admin client para bypasear RLS, server client para auth checks
- Estilo: Tailwind utility classes, sin CSS modules
- Errores API: `{ error: string }` con HTTP status codes apropiados
- Auth: todas las rutas API verifican autenticacion, admin endpoints verifican rol
- AI: usar `getAIExtractor()` de `src/lib/ai` para cualquier extraccion OCR
- Cache: useUser() con module-level cache, clearUserCache() para invalidar
