# JEC HUB - Proyecto de Gestion Musical

App web para la iglesia "Jesus Es El Camino" (JEC). Gestiona canciones con chord charts, programas de culto, y equipo de musica.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL, Auth, Storage)
- **AI**: Gemini (gratis, default) + Claude API (premium, backup) para OCR de chord charts
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
      programas/         # Programas de culto (pendiente)
      calendario/        # Calendario (pendiente)
      equipo/            # Gestion de equipo y roles (admin only)
      importar/          # Pagina de importacion (upload individual + Dropbox)
      ajustes/           # Ajustes del usuario
    api/
      songs/             # CRUD de canciones
        [id]/
          route.ts       # GET/PATCH/DELETE una cancion
          original/      # GET signed URL del archivo original
        import/route.ts  # POST importar archivo individual con AI
        route.ts         # GET lista de canciones
      migration/         # Migracion masiva desde Dropbox
        catalog/         # POST listar archivos Dropbox
        download/        # POST descargar archivos a Storage
        process/         # POST procesar con AI (usa abstraccion)
        status/          # GET estado de migracion
      users/             # Gestion de usuarios (admin only)
        [id]/route.ts    # PATCH rol de usuario
        route.ts         # GET lista de usuarios
      me/                # GET perfil del usuario actual
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
      database.ts        # Song, Profile, ImportJob, ImportItem types
  hooks/
    use-user.ts          # Hook para perfil/rol del usuario (cached)
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
- Env var: `GEMINI_API_KEY`

### Claude (premium, backup)
- Modelo: `claude-sonnet-4-5-20250929`
- Uso: Migracion masiva (scripts/migrate.ts) + opcion premium en web UI
- Mejor calidad de OCR, especialmente para archivos dificiles
- Env var: `ANTHROPIC_API_KEY`

Ambos usan el mismo prompt de extraccion (definido en `src/lib/gemini/prompts.ts`).

## Roles y Permisos

### Administrador
Cuentas admin: `christian.mastro@gmail.com`, `musicosjesuseselcamino@gmail.com`

Permisos:
- Ver todas las canciones (publicadas y borradores)
- Crear, editar y eliminar canciones
- **Editar acordes**: reposicionar acordes con editor visual (Modo Acordes)
- Publicar canciones en borrador
- Ver archivos originales importados (split view)
- Importar canciones individuales (upload JPG/PNG/PDF + AI)
- Migrar canciones masivamente desde Dropbox
- Gestionar usuarios y roles (/equipo)
- Crear y editar programas de culto

### Miembro (usuario comun)
Permisos:
- Ver canciones publicadas
- Transponer tonalidad
- Cambiar tamanio de fuente
- Cambiar notacion (cifrado/solfeo)
- Ver programas de culto
- Ver calendario

### Como cambiar roles
Los admins pueden promover/degradar usuarios desde la pagina /equipo.
Un admin no puede quitarse su propio rol de admin (proteccion contra auto-degradacion).

## ChordPro Format

Secciones soportadas: verse, chorus, bridge, precoro, intro, outro, interlude, tag
Directivas: {title:}, {artist:}, {key:}, {tempo:}, {time:}, {capo:}
Acordes entre corchetes: [Am]Letra con [G]acordes

## Features

### Editor Estructurado
- Metadata editable (titulo, artista, tonalidad, tempo, compas)
- Secciones con tipo seleccionable (Intro, Verso, Pre-Coro, Coro, Puente, Instrumental, Outro, Tag)
- Mover secciones arriba/abajo, eliminar, renombrar
- **Modo Texto**: ChordPro textarea por seccion (edicion directa de `[Am]texto`)
- **Modo Acordes**: Editor visual de posicion de acordes por linea
- Vista previa en vivo (split view)

### Editor Visual de Acordes (Modo Acordes)
- Muestra acordes como badges posicionados sobre las letras (fuente monospace)
- Click en acorde para seleccionarlo
- Botones izquierda/derecha para mover acorde caracter por caracter
- Boton eliminar para quitar un acorde
- Boton agregar para colocar un acorde nuevo en una posicion del texto
- Edicion inline de la letra de cada linea
- Utilidades en `src/lib/chordpro/chord-position.ts`:
  - `lineToPositions()` / `positionsToLine()`: conversion bidireccional
  - `moveChord()`, `addChord()`, `removeChord()`

### Importacion Individual de Archivos
- Pagina `/importar` con zona drag-and-drop
- Selector de provider AI: Gemini (gratis, default) o Claude (premium)
- Soporta: JPG, PNG, WebP, PDF (max 10MB)
- API: `POST /api/songs/import` con FormData
- Crea cancion como borrador, sube original a Storage
- Redirect automatico al editor para revisar/corregir

### Vista de Archivo Original
- Boton "Ver Original" en cancion (admin only)
- Muestra imagen/PDF original importado al lado del ChordPro
- Signed URLs de Supabase Storage (1 hora de validez)

### Pagina de Login
- Diseno split-screen con imagen de adoracion (Unsplash)
- Versiculo biblico (Salmos 96:1)
- Responsive (stacked en mobile, side-by-side en desktop)

## Migracion Masiva (scripts/migrate.ts)

Usa Claude API (claude-sonnet-4-5-20250929) para OCR de chord charts desde Dropbox.
- Rate limit: ~30 RPM (conservador)
- Retry automatico en errores 429
- Skip de archivos ya procesados
- Escape de caracteres no-ASCII para HTTP headers de Dropbox

Requiere env vars: `ANTHROPIC_API_KEY`, `DROPBOX_TOKEN`
Ejecutar: `npx tsx scripts/migrate.ts`

## Convenios

- Idioma UI: Espanol
- Componentes: "use client" explicito, funcional con hooks
- API: admin client para bypasear RLS, server client para auth checks
- Estilo: Tailwind utility classes, sin CSS modules
- Errores API: `{ error: string }` con HTTP status codes apropiados
- Auth: todas las rutas API verifican autenticacion, admin endpoints verifican rol
- AI: usar `getAIExtractor()` de `src/lib/ai` para cualquier extraccion OCR
