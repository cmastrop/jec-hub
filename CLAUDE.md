# JEC HUB - Plataforma de Gestion Musical

App web para la iglesia "Jesus Es El Camino" (JEC). Gestiona canciones con chord charts, programas de culto, y equipo de musica. Primer modulo de lo que sera la plataforma integral de la iglesia.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL, Auth, Storage)
- **AI**: Gemini (gratis, importacion individual) + Claude API (premium, migracion masiva)
- **Drag & Drop**: @dnd-kit (reordenamiento de canciones en setlists)
- **Dropbox**: OAuth2 con refresh tokens (conexion permanente, nunca expira)
- **Deploy**: Vercel — deploy manual con `npx vercel --prod`
- **Dominios**: `hub.jesuseselcamino.com.au` (produccion) / `jec-hub.vercel.app` (alias)
- **Repo**: https://github.com/cmastrop/jec-hub

## Estructura del Proyecto

```
src/
  middleware.ts           # Auth middleware (rutas publicas, redirects)
  app/
    page.tsx              # Landing page (split-screen, features, CTAs)
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
      auth/
        dropbox/
          route.ts       # GET iniciar OAuth de Dropbox (redirect a Dropbox)
          callback/
            route.ts     # GET callback OAuth (intercambia code por refresh token)
      dropbox/
        status/route.ts  # GET verificar si Dropbox esta conectado
        token/route.ts   # GET token fresco / DELETE desconectar Dropbox
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
        catalog/         # POST catalogar archivos (detecta resume automatico)
        download/        # POST descargar archivos a Storage (batch=5, timeout safety)
        process/         # POST procesar con Claude AI (batch=2, timeout safety)
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
      dropbox-migration.tsx      # Componente migracion Dropbox (fases: conectar/catalogar/descargar/procesar)
      migration-progress.tsx     # Barra de progreso con errores
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
    dropbox/
      oauth.ts           # OAuth URL, exchangeCodeForTokens, refreshAccessToken
      client.ts          # getDropboxClient, getFreshAccessToken, listAllDropboxFiles, downloadDropboxFile
    gemini/
      client.ts          # Gemini API client (gemini-1.5-flash)
      extract.ts         # extractChordProFromImage()
      prompts.ts         # Prompts de extraccion (compartidos con Claude adapter)
    supabase/
      client.ts          # Supabase browser client
      server.ts          # Supabase server client (SSR) — exporta createClient()
      admin.ts           # Supabase admin client (service role, bypasses RLS)
    migration/
      utils.ts           # RateLimiter, getFileType, toStoragePath, isProcessableByGemini
    types/
      database.ts        # Song, Profile, Setlist, SetlistSong, ImportJob, ImportItem, DropboxToken, MigratedFile
  hooks/
    use-user.ts          # Hook para perfil/rol del usuario (cached, clearUserCache)
scripts/
  migrate.ts             # Script legacy de migracion Dropbox -> Supabase (Claude API, batch)
```

## Variables de Entorno

```
NEXT_PUBLIC_SUPABASE_URL       # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Clave publica Supabase
SUPABASE_SERVICE_ROLE_KEY      # Clave de servicio (bypasses RLS)
GEMINI_API_KEY                 # Google Gemini API (gratis, importacion individual)
ANTHROPIC_API_KEY              # Claude API (migracion masiva)
NEXT_PUBLIC_DROPBOX_APP_KEY    # Dropbox app key (4b1t5mpw1vqxfp4)
DROPBOX_APP_SECRET             # Dropbox app secret (DEBE tener valor, no vacio)
NEXT_PUBLIC_APP_URL            # URL de la app (produccion: https://hub.jesuseselcamino.com.au)
CRON_SECRET                    # Secret para cron jobs
```

**IMPORTANTE**: En Vercel, asegurar que las variables no tengan `\n` al final (causa errores como `Invalid client_id`).

## Base de Datos (Supabase)

### Tabla `songs`
- `id` (uuid), `title`, `artist`, `original_key`, `chordpro_content`
- `tempo` (int), `time_signature` (text), `language`, `notes`
- `status` ("draft" | "published" | "archived")
- `source_type` ("manual" | "import_image" | "import_pdf" | "import_dropbox")
- `original_file_url` (path en Storage bucket "originals")
- `tags` (text[]), `created_by`, `created_at`, `updated_at`

### Tabla `profiles`
- `id` (uuid, FK auth.users), `email`, `full_name`, `role` ("admin" | "member")
- `avatar_url`, `notation_preference` ("letter" | "solfege"), `font_size_preference` (int)

### Tabla `setlists`
- `id` (uuid), `title`, `service_type` (domingo/miercoles/jovenes/oracion/especial/otro)
- `service_date` (date), `notes`, `created_by`, `created_at`, `updated_at`

### Tabla `setlist_songs`
- `id` (uuid), `setlist_id` (FK setlists), `song_id` (FK songs)
- `position` (int, unique per setlist), `transpose_key`, `capo`, `notes`

### Tabla `dropbox_tokens`
- `id` (uuid), `user_id` (uuid, FK auth.users, UNIQUE), `refresh_token` (text)
- `account_id` (text), `created_at`, `updated_at`
- RLS habilitado, acceso solo via service role (admin client)

### Tabla `import_jobs`
- `id` (uuid), `source` ("dropbox" | "upload"), `status` (pending/processing/completed/failed/paused)
- `total_files`, `processed_files`, `failed_files`, `error_log` (jsonb)
- `created_by`, `created_at`, `updated_at`

### Tabla `import_items`
- `id` (uuid), `job_id` (FK import_jobs), `original_filename`, `file_type`
- `storage_path`, `status` (pending/processing/completed/failed/skipped/review)
- `gemini_raw_response`, `extracted_chordpro`, `song_id` (FK songs), `error_message`

### Tabla `migrated_files`
- `id` (uuid), `dropbox_path` (text, UNIQUE), `storage_path`, `file_type`, `file_size`
- `dropbox_folder`, `status` (pending/downloading/downloaded/processed/error), `error_message`

### Storage Bucket: `originals`
- Archivos originales importados (PDFs, imagenes) desde Dropbox o upload individual

## Dropbox OAuth (Conexion Permanente)

### Flujo
1. Usuario clickea "Conectar Dropbox" en `/importar`
2. `GET /api/auth/dropbox` → redirige a Dropbox con `token_access_type=offline`
3. Dropbox redirige a `GET /api/auth/dropbox/callback` con authorization code
4. Callback intercambia code por `access_token` + `refresh_token` (NUNCA expira)
5. `refresh_token` se guarda en tabla `dropbox_tokens` (upsert por user_id)
6. Cada operacion usa `getFreshAccessToken()` que genera un access_token nuevo con el refresh_token

### Archivos clave
- `src/lib/dropbox/oauth.ts` — getDropboxAuthUrl, exchangeCodeForTokens, refreshAccessToken
- `src/lib/dropbox/client.ts` — getFreshAccessToken (busca refresh_token en DB, pide access_token fresco)

### Configuracion requerida en Dropbox App Console
- Redirect URIs:
  - `https://hub.jesuseselcamino.com.au/api/auth/dropbox/callback`
  - `https://jec-hub.vercel.app/api/auth/dropbox/callback`
  - `http://localhost:3000/api/auth/dropbox/callback` (desarrollo)

### Nota tecnica
- `downloadDropboxFile()` usa `fetch` directo a la API de Dropbox (NO el SDK)
- El SDK de Dropbox (`fileBinary`) no funciona en Vercel serverless con `globalThis.fetch`
- Cada descarga tiene timeout de 30s via `AbortController`

## AI Providers

Capa de abstraccion en `src/lib/ai/`:
- **Interface**: `AIExtractor { extractChordPro(buffer, mimeType) -> ExtractionResult }`
- **Factory**: `getAIExtractor(provider)` retorna Gemini o Claude adapter

### Gemini (importacion individual)
- Modelo: `gemini-1.5-flash`
- Uso: Importacion individual de archivos desde la web UI (`/importar`)
- Free tier: suficiente para uso diario (pocas canciones)

### Claude (migracion masiva)
- Modelo: `claude-sonnet-4-5-20250929`
- Uso: Migracion masiva via web UI (endpoint `/api/migration/process`)
- Mejor calidad de OCR, especialmente para archivos dificiles
- Sin limite diario como Gemini

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
- **Migrar canciones masivamente desde Dropbox** (conectar cuenta, catalogar, descargar, procesar)
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

### Migracion Masiva desde Dropbox (Web UI)
- Componente: `src/components/migration/dropbox-migration.tsx`
- Fases: loading → disconnected → idle → cataloging → downloading → processing → paused → completed
- **Catalogo inteligente**: detecta archivos pendientes y resume sin re-escanear Dropbox
- **Skip download**: si la descarga ya termino, salta directo al procesamiento
- **Descarga**: batch=5 archivos, safety timeout 45s, archivos >15MB se saltan, ordena por tamanio (chicos primero)
- **Procesamiento**: batch=2, Claude API, safety timeout 50s
- **Retry automatico**: hasta 5 reintentos en timeouts 504 del servidor
- **Content-type check**: verifica JSON antes de parsear (evita errores en timeouts de Vercel)

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

### Landing Page
- Diseno split-screen igual que login (imagen de adoracion a la izquierda)
- Panel derecho: logo, grid de features (Canciones, Programas, Calendario, Equipo), CTAs
- Botones: "Iniciar Sesion" (primary) + "Crear Cuenta" (outline)
- Mobile: hero image como banner superior, contenido stacked
- Versiculo: "Cantad a Jehova cantico nuevo" (Salmos 96:1)

### Pagina de Login
- Diseno split-screen con imagen de adoracion
- Responsive (stacked en mobile, side-by-side en desktop)

## Deploy

- **Plataforma**: Vercel (proyecto `jec-hub` en team `cmastrops-projects`)
- **Dominio produccion**: `hub.jesuseselcamino.com.au`
- **Alias Vercel**: `jec-hub.vercel.app`
- **Auto-deploy NO esta configurado** (no hay webhook de GitHub → Vercel)
- **Deploy manual**: `npx vercel --prod` desde la raiz del proyecto (CLI autenticado como `cmastrop`)
- **Force deploy** (sin cache): `npx vercel --prod --force`
- El build usa Turbopack (`next build`), ~23s en Vercel
- Variables de entorno configuradas en Vercel Dashboard y via `npx vercel env add`
- **Hobby plan**: funciones serverless max 60s (`maxDuration = 60`)

### DNS
- Dominio `jesuseselcamino.com.au` registrado en **Crazy Domains** (Australia)
- Nameservers apuntan a **Vercel**: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- Registros DNS gestionados en Vercel (no en Crazy Domains)
- Registros actuales:
  - `@` → A `27.124.125.171` (sitio web iglesia)
  - `www` → A `27.124.125.171`
  - `mail` → A `103.20.200.233`
  - `@` → MX `mail.cleanmysite.com.au` (priority 1)
  - `hub` → ALIAS Vercel (automatico, sirve JEC Hub)
- Email activo: `hola@jesuseselcamino.com.au`

## Middleware (Auth)

- Archivo: `src/middleware.ts`
- Rutas publicas (sin auth): `/`, `/login`, `/registro`, `/api/*`
- Unauthenticated → redirige a `/login`
- Authenticated en `/login` o `/registro` → redirige a `/canciones`
- Matcher excluye: `_next/static`, `_next/image`, `favicon.ico`, `logo.webp`, imagenes

## Migracion Dropbox

### Estado Actual (Segunda Corrida via Web UI)
- **Descarga completada**: 3,305 archivos descargados a Supabase Storage
- **Errores de descarga**: 250 (archivos >15MB, timeouts, etc.)
- **Procesamiento con Claude AI**: en curso (~13,800 archivos pendientes)
- **Canciones en DB**: ~2,157 (todas como borrador)
- **Metodo**: Web UI en `/importar` con OAuth de Dropbox (token permanente)

### Primera Corrida (Legacy, via script)
- Script: `scripts/migrate.ts` (usa Claude API directo)
- Resultado: 985 canciones nuevas, 1,000 saltadas (ya existentes)
- Fallos: 1,505 (token expirado — motivó la implementación de OAuth)

### Limites Vercel (Hobby Plan)
- Funciones serverless: max 60 segundos
- Batch de descarga: 5 archivos, safety cut a 45s
- Batch de procesamiento: 2 archivos, safety cut a 50s
- Archivos >15MB se marcan como error (no son chord charts)
- Frontend retry automatico: hasta 5 reintentos en 504/timeout

## Convenios

- Idioma UI: Espanol
- Componentes: "use client" explicito, funcional con hooks
- API: admin client para bypasear RLS, server client para auth checks
- Import supabase server: `import { createClient } from "@/lib/supabase/server"` (NO `createServerClient`)
- Estilo: Tailwind utility classes, sin CSS modules
- Errores API: `{ error: string }` con HTTP status codes apropiados
- Auth: todas las rutas API verifican autenticacion, admin endpoints verifican rol
- AI: usar `getAIExtractor()` de `src/lib/ai` para cualquier extraccion OCR
- Cache: useUser() con module-level cache, clearUserCache() para invalidar
- Dropbox: usar `getFreshAccessToken()` para obtener token (NUNCA hardcodear tokens)

## Roadmap: JEC Platform

### Vision
JEC Hub evolucionara a **JEC Platform** — plataforma centralizada de la iglesia accesible desde `jesuseselcamino.com.au`. Multiples ministerios como modulos independientes con autenticacion unificada.

### Fase 1: Consolidacion (proximo)
- [ ] Apuntar `jesuseselcamino.com.au` a Vercel (el dominio raiz)
- [ ] Redisenar landing page como portal de la iglesia (no solo musica)
- [ ] Dashboard post-login con acceso a ministerios
- [ ] Mover rutas de musica bajo `/musica/*`

### Fase 2: Multi-idioma
- [ ] Soporte Espanol/Ingles
- [ ] Preferencia de idioma en perfil de usuario
- [ ] ~24 archivos con texto hardcodeado en espanol para traducir

### Fase 3: Seguridad avanzada
- [ ] Verificacion de email (Supabase lo soporta nativamente)
- [ ] Verificacion de mobile (SMS via Supabase + Twilio)

### Fase 4: Nuevos ministerios
- [ ] Panel Ministerio Pastoral
- [ ] Panel Ministerio de Jovenes
- [ ] Sistema de roles por ministerio (admin de musica vs admin pastoral)

### Fase 5: Rediseno profesional
- [ ] Redesign completo de la web publica
- [ ] Branding unificado
- [ ] Responsive optimizado
- [ ] SEO y performance
