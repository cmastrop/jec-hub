# JEC Platform - Plataforma Integral de la Iglesia

Plataforma web para la iglesia "Jesus Es El Camino" (JEC). Incluye sitio publico de la iglesia (`jesuseselcamino.com.au`) y plataforma de gestion musical (`hub.jesuseselcamino.com.au`). Gestiona canciones con chord charts, programas de culto, equipo de musica, y pagina publica bilingue de la iglesia.

## Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript (App Router)
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase (PostgreSQL, Auth, Storage)
- **AI**: Gemini (gratis, importacion individual) + Claude API (premium, migracion masiva)
- **Drag & Drop**: @dnd-kit (reordenamiento de canciones en setlists)
- **Dropbox**: OAuth2 con refresh tokens (conexion permanente, nunca expira)
- **Animaciones**: framer-motion (menu mobile iglesia) + CSS IntersectionObserver (scroll animations)
- **Deploy**: Vercel — deploy manual con `npx vercel --prod`
- **Dominios**:
  - `jesuseselcamino.com.au` → pagina publica de la iglesia (`/iglesia`)
  - `www.jesuseselcamino.com.au` → idem (redirect)
  - `hub.jesuseselcamino.com.au` → plataforma de gestion musical
  - `jec-hub.vercel.app` → alias Vercel
- **Repo**: https://github.com/cmastrop/jec-hub

## Estructura del Proyecto

```
src/
  middleware.ts           # Auth middleware + church domain rewrite
  app/
    page.tsx              # Landing page JEC Hub (split-screen, features, CTAs)
    iglesia/             # Pagina publica de la iglesia (jesuseselcamino.com.au) — multi-pagina
      layout.tsx         # Layout con Playfair Display font + SEO metadata + ChurchShell wrapper
      page.tsx           # Homepage: hero + servicios + ministerios preview + CTA
      nosotros/page.tsx  # About: vision (3 pilares), mision, pastores
      ministerios/page.tsx # Ministerios: grid completo de ministerios con links a paginas individuales
        hombres/page.tsx   # Ministerio de Hombres: intro, features, lider, CTA
        mujeres/page.tsx   # Ministerio de Mujeres: intro, features, lider, CTA
        jovenes/page.tsx   # Ministerio de Jovenes (Zoe Zone): intro, features, lider, CTA
        ninos/page.tsx     # Escuela Dominical: intro, features, lider, CTA
        adoracion/page.tsx # Equipo de Adoracion: intro, features, lider, CTA
      eventos/page.tsx   # Eventos: calendario publico + lista de eventos
      en-vivo/page.tsx   # Live stream: YouTube embed (channel ID UChDID8HMZhz_VbzcU9U78lg) + horarios + CTA subscribe
      contacto/page.tsx  # Contacto: 3 info cards overlapping + formulario
      sermones/page.tsx  # Sermones: featured + grid con YouTube embeds + Spotify podcasts
        la-epoca-dorada-del-matrimonio/page.tsx  # Blog: sermon notes (Family & Faith)
        el-don-de-la-sabiduria/page.tsx          # Blog: sermon notes (Spiritual Gifts)
        el-arbol-de-la-vida/page.tsx             # Blog: sermon notes (Bible Study)
      testimonios/page.tsx # Testimonios: cards con fotos + CTA compartir
      donar/page.tsx     # Donar: scripture + 2-col (formas de dar + 3 cuentas bancarias + impacto)
    (auth)/              # Layout de autenticacion (login/registro)
      layout.tsx         # Split layout con imagen de adoracion + form
      login/page.tsx     # Pagina de login
      registro/page.tsx  # Pagina de registro
    (app)/               # Layout principal con sidebar (requiere auth)
      canciones/         # Biblioteca de canciones
        [id]/page.tsx    # Vista detalle: ChordPro viewer + editor estructurado + ver original
        artistas/page.tsx       # Lista de artistas con conteo de canciones
        artistas/[artist]/page.tsx  # Canciones filtradas por artista
        categorias/page.tsx     # Lista de categorias con iconos y descripciones
        categorias/[category]/page.tsx  # Canciones filtradas por categoria
        duplicados/      # Deteccion y gestion de canciones duplicadas (admin)
      programas/         # Programas de culto (setlists)
        page.tsx         # Lista de programas con filtros y creacion
        [id]/page.tsx    # Detalle: canciones con drag-and-drop, edicion, eliminacion
      calendario/        # Calendario conectado a programas reales
      eventos/           # Gestion de eventos iglesia (admin: crear/aprobar/publicar/editar/eliminar)
      ministerios/       # CMS por ministerio (pastor/admin/lider_ministerio)
        page.tsx         # Grid de ministerios segun rol del usuario
        [slug]/page.tsx  # Overview del ministerio (links a contenido, eventos proximamente)
        [slug]/contenido/page.tsx  # Block editor de la pagina publica del ministerio
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
      events/            # Eventos publicos de la iglesia
        route.ts         # GET publico (published) / POST crear (admin)
        [id]/route.ts    # GET/PATCH/DELETE evento individual (admin)
      cms/               # CMS block editor (Fase 3b)
        blocks/route.ts  # GET bloques (publico published / ?all=true editor) / POST crear
        blocks/[id]/route.ts      # PATCH contenido-estado / DELETE bloque
        blocks/reorder/route.ts   # PATCH orden tras drag-and-drop
        media/route.ts   # GET lista / POST upload imagen a bucket cms-media
      ministries/route.ts # GET lista de ministerios activos (auth)
      songs/             # CRUD de canciones
        [id]/
          route.ts       # GET/PATCH/DELETE una cancion
          original/      # GET signed URL del archivo original
        import/route.ts  # POST importar archivo individual con AI
        bulk/route.ts    # PATCH publicacion/estado masivo (admin)
        duplicates/      # GET deteccion de duplicados (admin)
        artists/route.ts # GET lista de artistas con conteo de canciones
        categories/route.ts # GET canciones agrupadas por tags/categorias
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
    cms/                           # Componentes del block editor (Fase 3b)
      block-editor.tsx             # Editor: lista sortable (dnd-kit), agregar/editar/publicar/eliminar
      block-form.tsx               # Formulario por tipo de bloque con tabs ES/EN + media picker
      block-renderer.tsx           # Renderiza los 9 tipos de bloque con diseno iglesia
      media-picker.tsx             # Modal eleccion/upload de imagenes (bucket cms-media)
    iglesia/                       # Componentes compartidos pagina iglesia
      church-shell.tsx             # Client wrapper: LangContext provider + header + footer
      dynamic-blocks.tsx           # Renderiza bloques CMS published; fallback a children (hardcodeado)
      church-header.tsx            # Sticky nav con 7 links + Give CTA dorado, transparent/opaque segun pathname
      church-footer.tsx            # Footer con traducciones bilingues
      fade-in.tsx                  # Scroll animations: fade-up, fade-left, fade-right, scale-in (CSS + IntersectionObserver)
      page-hero.tsx                # Banner 40vh para sub-paginas (imagen + label + titulo + titleAccent + allowOverlap)
      section-heading.tsx          # Label + titulo + divisor reutilizable (soporta modo light/dark)
    migration/
      dropbox-migration.tsx      # Componente migracion Dropbox (fases: conectar/catalogar/descargar/procesar)
      migration-progress.tsx     # Barra de progreso con errores
    layout/
      sidebar.tsx                # Sidebar de navegacion
      header.tsx                 # Header con menu de usuario + badge admin
    ui/                          # Componentes base (button, input, card, etc.)
  lib/
    auth/
      permissions.ts     # requireAuth / requireRole / requireMinistryAccess (server-side)
    ai/
      types.ts           # AIProvider, ExtractionResult, AIExtractor interface
      gemini-adapter.ts  # Adapter Gemini (wraps lib/gemini/extract)
      claude-adapter.ts  # Adapter Claude (Anthropic SDK)
      index.ts           # Factory getAIExtractor() + re-exports
    chordpro/
      parser.ts          # Parsea ChordPro string -> ChordProSong (auto-merge chord+text lines)
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
    iglesia/
      types.ts           # Lang type ("en" | "es"), LangContextValue interface
      translations.ts    # 105+ translation keys EN/ES (toda la pagina iglesia)
      use-lang.ts        # React Context + useLang() hook
    migration/
      utils.ts           # RateLimiter, getFileType, toStoragePath, isProcessableByGemini
    types/
      database.ts        # Song, Profile, Setlist, SetlistSong, ImportJob, ImportItem, DropboxToken, MigratedFile, ChurchEvent
      cms.ts             # Ministry, MinistryMember, PageBlock (BlockType), PageMedia, Sermon, Podcast
  hooks/
    use-user.ts          # Hook para perfil/rol del usuario (cached, clearUserCache)
scripts/
  migrate.ts             # Script legacy de migracion Dropbox -> Supabase (Claude API, batch)
  scrape-lacuerda.mjs    # Scraping 51 artistas de LaCuerda.net → lacuerda_cristiano.json
  upload-lacuerda.mjs    # Upload canciones de La Cuerda a Supabase con categorias
  scrape-freidzon.mjs    # Scraping canciones de Claudio Freidzon
  process-worshipleader.mjs  # Importa canciones desde SQLite de WorshipLeader
  assign-artists-web.mjs # 278 mapeos titulo->artista hardcodeados
  categorize*.mjs        # Scripts de categorizacion (dropbox, remaining, general)
  cleanup-*.mjs          # Limpieza de duplicados y datos
  fix-*.mjs              # Fixes: chord positions, solfege, short songs, worshipleader
  export-songs.py        # Exporta canciones a Excel
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
SUPABASE_ACCESS_TOKEN          # Token Management API (solo local, para ejecutar SQL via api.supabase.com)
```

**IMPORTANTE**: En Vercel, asegurar que las variables no tengan `\n` al final (causa errores como `Invalid client_id`).

### Proyecto Supabase
- **Nombre**: jec-hub
- **Ref**: `avowxrzsqgetktqrefxa`
- **Region**: Oceania (Sydney) — `ap-southeast-2`
- **Plan**: Free
- **URL**: `https://avowxrzsqgetktqrefxa.supabase.co`
- **Org ID**: `pvghwrrsdnhddftddhdh`
- **Nota**: Proyecto anterior (`dlpopmazvupiukpxurmf`) fue eliminado. Recreado el 2026-03-26.
- **Auth Site URL**: `https://hub.jesuseselcamino.com.au` (configurado via Management API)
- **Auth Redirect URIs**: `hub.jesuseselcamino.com.au/**`, `jec-hub.vercel.app/**`, `localhost:3000/**`

## Base de Datos (Supabase)

### Tabla `songs`
- `id` (uuid), `title`, `artist`, `original_key`, `chordpro_content`
- `tempo` (int), `time_signature` (text), `language`, `notes`
- `status` ("draft" | "published" | "archived")
- `source_type` ("manual" | "import_image" | "import_pdf" | "import_dropbox")
- `original_file_url` (path en Storage bucket "originals")
- `tags` (text[]), `created_by`, `created_at`, `updated_at`

### Tabla `profiles`
- `id` (uuid, FK auth.users), `email`, `full_name`, `role` ("pastor" | "admin" | "lider_ministerio" | "member")
- `avatar_url`, `notation_preference` ("letter" | "solfege"), `font_size_preference` (int)

### Tablas CMS (Fase 3 — creadas y aplicadas en produccion 2026-06-11)
Migracion: `supabase/migrations/20260611000000_cms_foundation.sql` (idempotente)
- `ministries`: slug UNIQUE, name_en/es, leader_name, leader_user_id, image_url, description_en/es, active. Seed: hombres (Morris), mujeres (Daisy), jovenes (Raquel), ninos (Clara), adoracion (Ronal)
- `ministry_members`: ministry_id + user_id UNIQUE, role ("lider" | "colaborador" | "miembro")
- `page_blocks`: page_slug, ministry_id, block_type (9 tipos), position, content_en/content_es (jsonb), status ("draft" | "published")
- `page_media`: storage_path UNIQUE (bucket `cms-media`), alt_text, uploaded_by
- `sermons`: slug UNIQUE, title, speaker, youtube_id, spotify_id, series, blog_content, status (para Fase 3c)
- `podcasts`: title, spotify_episode_id, published_date, status (para Fase 3c)
- `church_events.ministry_id` (FK ministries) agregada
- RLS: SELECT publico solo para published en page_blocks/sermons/podcasts; el resto solo service role

### Tabla `setlists`
- `id` (uuid), `title`, `service_type` (domingo/miercoles/jovenes/oracion/especial/otro)
- `service_date` (date), `notes`, `created_by`, `created_at`, `updated_at`

### Tabla `setlist_songs`
- `id` (uuid), `setlist_id` (FK setlists), `song_id` (FK songs)
- `position` (int, unique per setlist), `transpose_key`, `capo`, `notes`

### Tabla `church_events`
- `id` (uuid), `title` (text), `description` (text)
- `event_date` (date), `start_time` (text), `end_time` (text)
- `location` (text, default "73 Nollamara Ave, Nollamara WA 6061")
- `event_type` (text: service/youth/prayer/special/community/conference)
- `status` (text: draft/approved/published) — solo published se muestra en la web publica
- `recurring` (boolean), `recurring_day` (text: sunday/wednesday/etc)
- `created_by` (uuid, FK auth.users), `approved_by` (uuid, FK auth.users)
- `created_at`, `updated_at`
- **Flujo de aprobacion**: admin/pastor crea evento (draft) → aprueba (approved) → publica (published)
- **SQL para crear tabla**:
```sql
CREATE TABLE church_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time text,
  end_time text,
  location text DEFAULT '73 Nollamara Ave, Nollamara WA 6061',
  event_type text DEFAULT 'service' CHECK (event_type IN ('service','youth','prayer','special','community','conference')),
  status text DEFAULT 'draft' CHECK (status IN ('draft','approved','published')),
  recurring boolean DEFAULT false,
  recurring_day text,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE church_events ENABLE ROW LEVEL SECURITY;
```

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

### Storage Bucket: `cms-media` (publico)
- Imagenes subidas desde el CMS (media picker). Cada upload se registra en `page_media`
- URL publica: `{SUPABASE_URL}/storage/v1/object/public/cms-media/{path}`

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

**4 niveles desde Fase 3a** (2026-06-11): `pastor` > `admin` > `lider_ministerio` > `member`.
- `pastor` y `admin` tienen acceso global identico (`isAdmin` retorna true para ambos)
- `lider_ministerio` edita el contenido CMS de SU ministerio (segun `ministry_members` con role lider/colaborador)
- PENDIENTE: asignar roles reales en produccion (todos los perfiles siguen como admin/member)

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
- **Gestionar eventos de la iglesia**: crear/editar/eliminar eventos, flujo de aprobacion (draft → approved → published)

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
- **Navegar por artista**: `/canciones/artistas` lista artistas con conteo, click navega a canciones del artista
- **Navegar por categoria**: `/canciones/categorias` grid con iconos/gradientes, click navega a canciones de la categoria
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
- **Drag & drop**: arrastrar acordes con mouse o touch (mobile)
- Click para seleccionar, flechas para mover caracter por caracter
- Agregar/eliminar acordes, renombrar acordes, editar letra inline
- Activacion por linea: solo una linea activa a la vez (limpia estado al cambiar)
- Collision detection: previene dos acordes en la misma posicion
- Utilidades en `src/lib/chordpro/chord-position.ts`
- **Font size dual**: controles separados para tamanio de letra y tamanio de acordes (10-36px)

### Importacion Individual de Archivos
- Zona drag-and-drop en `/importar`
- Selector de provider AI: Gemini (gratis) o Claude (premium)
- Soporta: JPG, PNG, WebP, PDF (max 10MB)
- Crea borrador, redirect al editor

### Eventos de la Iglesia (Publico + Admin)

**Pagina publica** (`/iglesia/eventos`):
- Calendario mensual con badges coloreados por tipo de evento
- Lista de eventos con fecha, hora, ubicacion, descripcion
- Link para agregar cada evento a Google Calendar
- Solo muestra eventos con `status: "published"`
- Bilingue EN/ES (meses, dias, labels)

**Pagina admin** (`/(app)/eventos`):
- CRUD completo de eventos con formulario inline
- Filtros por estado: todos / borrador / aprobado / publicado
- **Flujo de aprobacion**: crear (draft) → aprobar (approved) → publicar (published)
- EventCards expandibles con acciones: editar, publicar/despublicar, eliminar
- Solo accesible por admins (guard con `useUser()` + `isAdmin`)

**API** (`/api/events`):
- `GET /api/events?from=&to=` — publico, retorna solo eventos published
- `GET /api/events?all=true` — admin, retorna todos los eventos
- `POST /api/events` — admin, crear evento
- `PATCH /api/events/[id]` — admin, editar evento
- `DELETE /api/events/[id]` — admin, eliminar evento

**Tipos de evento**: service (gold `#C9A86C`), youth (verde `#6B8E23`), prayer (violeta `#8B5CF6`), special (rojo `#E74C3C`), community (azul `#3498DB`), conference (naranja `#E67E22`)
- **Tabla**: `church_events` en Supabase (ya existe en produccion)

### Pagina Publica de la Iglesia (`/iglesia` — multi-pagina)
- Accesible en `jesuseselcamino.com.au` (middleware rewrite) y `hub.../iglesia` (directo)
- **Arquitectura multi-pagina**: cada seccion tiene su propia ruta con `Link` navigation
- **Bilingue**: toggle EN/ES en header, React Context (`LangContext`) persiste idioma durante client-side navigation
- **EN**: "Jesus Is The Way" / **ES**: "Jesus Es El Camino"

**Rutas:**
| Ruta | Contenido |
|------|-----------|
| `/iglesia` | Homepage: hero + servicios + ministerios preview + CTA |
| `/iglesia/nosotros` | Vision (3 pilares) + Mision + Pastores |
| `/iglesia/ministerios` | Grid completo de ministerios (5 cards con links a paginas individuales) |
| `/iglesia/ministerios/hombres` | Ministerio de Hombres: verso, 3 features, lider Morris, CTA |
| `/iglesia/ministerios/mujeres` | Ministerio de Mujeres: verso, 3 features, lider Daisy, CTA |
| `/iglesia/ministerios/jovenes` | Zoe Zone Jovenes: verso, 3 features, lider Raquel, CTA |
| `/iglesia/ministerios/ninos` | Escuela Dominical: verso, 3 features, lider Clara, CTA |
| `/iglesia/ministerios/adoracion` | Equipo Adoracion: verso, 3 features, lider Ronal, CTA |
| `/iglesia/en-vivo` | Live stream YouTube embed + horarios de servicio + CTA suscribirse |
| `/iglesia/eventos` | Calendario publico + lista de eventos |
| `/iglesia/contacto` | 3 info cards overlapping hero + formulario dark section |
| `/iglesia/sermones` | Featured sermon overlapping + grid 3x2 con play overlays + series badges |
| `/iglesia/testimonios` | Cards con fotos + categorias + CTA "compartir testimonio" |
| `/iglesia/donar` | Scripture quote + 2-col (formas de dar + 3 cuentas bancarias reales + impacto) |

**Componentes compartidos** (`src/components/iglesia/`):
- `ChurchShell`: wrapper con LangContext provider + header + footer (en `layout.tsx`)
- `ChurchHeader`: sticky nav con 7 links (Home, Nosotros, Ministerios, Sermones, Eventos, Testimonios, Contacto) + boton Give/Donar dorado con icono Heart. Transparente en homepage, opaco en sub-paginas. Mobile menu con framer-motion AnimatePresence.
- `ChurchFooter`: footer con traducciones bilingues
- `FadeIn`: scroll animations con IntersectionObserver + CSS transitions. Variantes: `fade-up`, `fade-left`, `fade-right`, `scale-in`. Prop `delay` para stagger.
- `PageHero`: banner 50vh/380px para sub-paginas (imagen + label + titulo). Props opcionales: `titleAccent` (dual-weight), `allowOverlap` (permite cards con `-mt-20`), `imagePosition` (custom object-position CSS)
- `SectionHeading`: label + titulo + divisor reutilizable

**Contenido por pagina:**
- **Homepage**: hero full-screen, servicios (Domingo 3-5PM + Miercoles 7:30-9PM), ministerios preview, CTA
- **Nosotros**: 3 pilares (Equipar/Enviar/Alcanzar), mision con parallax, pastores con stats
- **Ministerios**: 5 cards (Hombres, Mujeres, Jovenes "Zoe Zone", Escuela Dominical, Adoracion) con fotos overlay + paginas individuales por ministerio (intro, 3 features, lider, CTA)
- **En Vivo**: YouTube live embed (Channel ID `UChDID8HMZhz_VbzcU9U78lg`), horarios de servicio (Domingo/Miercoles), CTA suscribirse al canal, fallback cuando no hay live
- **Eventos**: calendario mensual con badges coloreados, lista de eventos, Google Calendar links
- **Contacto**: 3 cards equal-height overlapping hero (telefono, email, direccion), formulario dark section con mailto
- **Sermones**: featured sermon overlapping hero (2-col: imagen con play button + contenido), grid 3x2 con hover play overlay, series badge, metadata (speaker/date/duration)
- **Testimonios**: quote intro section, grid 3x2 cards con fotos (aspect-[4/3]), category labels, "Read More →", CTA dark "Your Story Matters"
- **Donar**: scripture quote (italic serif), 2-col layout: izq (3 formas de dar con iconos + 3 cuentas bancarias reales: Diezmos BSB 066-137 Acc 10092714, Pro Templo BSB 066-013 Acc 10355564, Jovenes con referencia) / der (4 impact cards + dark thank-you box)

**Diseno:**
- **Paleta**: parchment `#FAF8F5`, gold `#C9A86C`, dark brown `#4A3F35`, medium `#6B5D4D`
- **Fuente**: Playfair Display (serif) para titulos, Geist (sans) heredado del root layout
- **Animaciones**: CSS + IntersectionObserver (NO framer-motion para contenido — causa SSR blank)
- **framer-motion**: SOLO para mobile menu AnimatePresence
- Imagenes en `public/iglesia/` (~30 archivos: hero, pastores, ministerios, worship, gallery, leaders, 6 sermon-*.jpg, 6 testimony-*.jpg de Pexels, etc.)
- **IMPORTANTE — Imagenes repetidas**: Revisar que NO se reutilice la misma imagen en multiples paginas/secciones. Cada pagina y seccion debe tener su propia imagen unica. Antes de agregar una imagen, verificar que no este ya en uso en otra pagina. Usar `grep -r "src=\"/iglesia/" src/app/iglesia/` para auditar. Fotos stock de Pexels gratuitas (no usar fotos propias de la iglesia por falta de variedad).

**Traducciones** (`src/lib/iglesia/translations.ts`):
- 265+ keys organizados por seccion (nav, hero, services, vision, mission, ministries, individual ministry pages, pastors, events, contact, footer, sermons, testimonies, giving)
- `useLang()` hook retorna `{ lang, setLang, toggleLang }`

### Landing Page JEC Hub (`/`)
- Diseno split-screen igual que login (imagen de adoracion a la izquierda)
- Panel derecho: logo, grid de features (Canciones, Programas, Calendario, Equipo), CTAs
- Botones: "Iniciar Sesion" (primary) + "Crear Cuenta" (outline)
- Mobile: hero image como banner superior, contenido stacked
- Versiculo: "Cantad a Jehova cantico nuevo" (Salmos 96:1)

### Pagina de Login
- Diseno split-screen con imagen de adoracion
- Responsive (stacked en mobile, side-by-side en desktop)

## Estado de la Sesion (2026-06-11) — Para Retomar

- **10 commits locales SIN PUSHEAR** (`cb3a516..` hasta el ultimo): la red corporativa bloquea github.com y api.vercel.com (timeout TCP 443). Desde otra red: `git push origin master` + `npx vercel --prod`
- **Produccion DB ya actualizada**: migracion CMS aplicada via Management API (`api.supabase.com` SI funciona desde la red corporativa; token en `.env.local` como `SUPABASE_ACCESS_TOKEN`)
- **OJO**: el CLI de Supabase local quedo linkeado a heavensglow-v2 (`supabase/.temp/project-ref` = `hkukiapttwkqrhylogig`), NO usar `supabase db push` sin re-linkear a `avowxrzsqgetktqrefxa`
- **Truco PowerShell 5.1 + Management API**: leer SQL con `[System.IO.File]::ReadAllText(path, UTF8)`, castear `[string]$sql.ToString()` antes de ConvertTo-Json, y enviar bytes UTF-8 con `-ContentType "application/json; charset=utf-8"`
- **Proximos pasos**: 1) push + deploy, 2) asignar roles reales (pastor/lideres), 3) Fase 3c (sermones/podcasts), 4) reemplazar 7 imagenes repetidas (auditoria hecha: worship.jpg x3, preaching.jpg x5, 5 fotos ministerio duplicadas homepage-preview vs hero; huerfanas reutilizables: speaker.jpg, worship-hands.jpg, sermon-1/2/4/5/6.jpg)

## Deploy

- **Plataforma**: Vercel (proyecto `jec-hub` en team `cmastrops-projects`)
- **Dominio iglesia**: `jesuseselcamino.com.au` (+ `www.`) → sirve `/iglesia`
- **Dominio hub**: `hub.jesuseselcamino.com.au` → sirve plataforma musical
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
  - `@` → ALIAS Vercel (sirve pagina iglesia via middleware rewrite a `/iglesia`)
  - `www` → ALIAS Vercel (idem)
  - `*` → ALIAS Vercel (wildcard)
  - `hub` → ALIAS Vercel (sirve JEC Hub plataforma musical)
  - `mail` → A `103.20.200.233`
  - `@` → MX `mail.cleanmysite.com.au` (priority 1)
  - `@` → CAA `0 issue "letsencrypt.org"`
- **A records viejos eliminados**: `27.124.125.171` ya no existe (era sitio viejo)
- Email activo: `hola@jesuseselcamino.com.au`

## Middleware (Auth + Domain Routing)

- Archivo: `src/middleware.ts`
- **Church domain detection**: `jesuseselcamino.com.au` / `www.` → rewrite a `/iglesia` (URL limpia)
- **Sub-route rewriting**: church domain + sub-rutas conocidas → rewrite a `/iglesia/*`
  - `/nosotros` → `/iglesia/nosotros`
  - `/ministerios` → `/iglesia/ministerios`
  - `/eventos` → `/iglesia/eventos`
  - `/contacto` → `/iglesia/contacto`
  - `/testimonios` → `/iglesia/testimonios`
  - `/donar` → `/iglesia/donar`
  - `/sermones` → `/iglesia/sermones`
  - `/en-vivo` → `/iglesia/en-vivo`
- Rutas `/iglesia` siempre publicas (sin auth, sin importar dominio)
- Rutas publicas (sin auth): `/`, `/login`, `/registro`, `/api/*`
- Unauthenticated → redirige a `/login`
- Authenticated en `/login` o `/registro` → redirige a `/canciones`
- Matcher excluye: `_next/static`, `_next/image`, `favicon.ico`, `logo.webp`, imagenes

## Migracion Dropbox

### Estado Actual (Marzo 2026 — Proyecto Recreado)
- **Proyecto Supabase anterior eliminado** — datos de migracion perdidos
- **Canciones recuperadas**: 8,743 (6,054 La Cuerda + 2,689 WorshipLeader) desde archivos locales
- **Canciones de Dropbox**: pendiente re-migrar (archivos siguen en Dropbox del usuario)
- **Metodo**: Web UI en `/importar` con OAuth de Dropbox (necesita reconectar)

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

### Fase 1: Consolidacion (completada)
- [x] Apuntar `jesuseselcamino.com.au` a Vercel (dominio raiz + www)
- [x] Pagina publica de la iglesia bilingue (`/iglesia`) con formulario de contacto
- [x] Middleware domain routing (church domain → `/iglesia` + sub-rutas)
- [x] Arquitectura multi-pagina iglesia (homepage, nosotros, ministerios, eventos, contacto)
- [x] Scroll animations con FadeIn (fade-up, fade-left, fade-right, scale-in)
- [x] Componentes compartidos iglesia (ChurchShell, ChurchHeader, ChurchFooter, PageHero, etc.)
- [x] Sistema de traducciones bilingue con React Context (LangProvider)
- [x] Gestion de eventos iglesia (admin: CRUD + flujo aprobacion)
- [x] Visual upgrade estilo Base44 (overlapping cards, dual-weight headings, pill buttons, gallery, 4-col footer)
- [x] Paginas sermones, testimonios y donar (Base44 design, fotos stock de Pexels)
- [x] Nav completo: 7 links + boton Give/Donar con Heart icon
- [x] Paginas individuales por ministerio (hombres, mujeres, jovenes, ninos, adoracion) con intro, features, lider, CTA
- [x] Reemplazo de imagenes repetidas en homepage, contacto y eventos con stock photos unicos
- [x] Pagina En Vivo (`/iglesia/en-vivo`) con YouTube live embed (Channel ID) + horarios + CTA subscribe
- [x] Navegacion por artista y categoria en biblioteca de canciones
- [x] APIs de artistas y categorias (`/api/songs/artists`, `/api/songs/categories`)
- [x] Editor de acordes drag-and-drop con soporte touch/mobile
- [x] Font size dual (letras + acordes independientes)
- [x] Parser ChordPro mejorado: auto-merge lineas de acordes + letras separadas
- [x] Recreacion proyecto Supabase (`avowxrzsqgetktqrefxa`) con 8,743 canciones recuperadas
- [x] 14 scripts de scraping/categorization/cleanup en `scripts/`

### Fase 2: Pendiente — Mejoras iglesia
- [ ] **AUDITORIA DE IMAGENES REPETIDAS**: Revisar TODAS las paginas y verificar que ninguna imagen se repita entre paginas o secciones. Actualmente `worship.jpg` aun se usa en nosotros (mision) y ministerios ("One Body"). Usar fotos unicas de Pexels para cada seccion. Comando para auditar: `grep -rn "iglesia/" src/app/iglesia/ | grep -E "\.(jpg|png|jpeg)" | sort`
- [x] Sermones: YouTube embeds reales + Spotify podcasts + paginas individuales con notas
- [ ] Testimonios: conectar a datos reales (actualmente placeholders estaticos)
- [ ] Testimonios: pagina individual por testimonio (click "Read More" no navega)
- [x] Donar: datos bancarios reales (3 cuentas: Diezmos, Pro Templo, Jovenes)
- [ ] Donar: integrar plataforma de pagos online (Stripe/PayPal)
- [ ] Contacto: backend real para formulario (actualmente usa mailto)
- [ ] Fotos reales de la iglesia (reemplazar stock photos de Pexels por fotos propias)
- [ ] SEO: meta tags por pagina, OpenGraph images, sitemap.xml
- [ ] Performance: Next.js Image component (actualmente usa `<img>` tags)
- [ ] Re-migrar canciones de Dropbox (archivos siguen en Dropbox, necesita reconectar OAuth)

### Fase 3: CMS Block Editor + Paneles Ministeriales (PLAN APROBADO)

**Vision**: Cada pagina publica de la iglesia se puede editar desde el backend (hub), como un web builder con bloques arrastrables. Cada ministerio gestiona su propia seccion. Pastor Morris aprueba todo.

**Estado**: Fases 3a y 3b COMPLETADAS (2026-06-11). Migracion aplicada en produccion, block editor funcionando. Siguiente: Fase 3c (sermones/podcasts).

#### Base de datos (6 tablas nuevas + 2 modificaciones)

**Nuevas tablas:**
1. `ministries` — registro de los 5 ministerios (slug, nombre EN/ES, lider, imagen)
2. `ministry_members` — vincula usuarios a ministerios con rol (lider/colaborador/miembro)
3. `page_blocks` — bloques de contenido editables por pagina (tipo, posicion, content_en jsonb, content_es jsonb)
4. `page_media` — imagenes subidas para el CMS (path en Storage, alt text)
5. `sermons` — sermones con youtube_id, spotify_id, series, blog_content, status
6. `podcasts` — episodios de Spotify con metadata

**Modificaciones:**
- `profiles.role`: expandir de `'admin'|'member'` a `'pastor'|'admin'|'lider_ministerio'|'member'`
- `church_events`: agregar columna `ministry_id` (FK a ministries)

#### Tipos de bloque soportados
- `hero` — banner con imagen + titulo + label
- `text` — titulo + cuerpo de texto
- `image` — imagen con caption
- `gallery` — grid de multiples imagenes
- `verse` — cita biblica destacada
- `cta` — boton call-to-action con link
- `video` — YouTube o Spotify embed
- `features` — grid de 3 features con icono + titulo + descripcion
- `leader` — perfil del lider con foto + bio

Cada bloque guarda `content_en` y `content_es` como JSONB (maxima flexibilidad por tipo).

#### Roles y permisos (4 niveles)

| Rol | Quien | Acceso |
|-----|-------|--------|
| `pastor` | Morris Velasquez | Admin global, aprueba todo |
| `admin` | christian.mastro@gmail.com | Power user, mismo acceso que pastor |
| `lider_ministerio` | Daisy, Raquel, Clara, Ronal | Edita SU ministerio (bloques, eventos draft, fotos) |
| `member` | Usuarios normales | Solo ve contenido publicado |

**Backward compatible**: `isAdmin` sigue retornando `true` para `pastor` y `admin`.

#### Sub-fases de implementacion

**Fase 3a: Foundation (DB + Roles + Auth) — COMPLETADA 2026-06-11**
- [x] SQL migration: CREATE 6 tablas + ALTER profiles + ALTER church_events (`supabase/migrations/20260611000000_cms_foundation.sql`, APLICADA en produccion via Management API)
- [x] `src/lib/auth/permissions.ts` — requireAuth(), requireRole(), requireMinistryAccess(); retornan union discriminada `{ok:true,user,profile} | {ok:false,response}`
- [x] Tipos CMS en `src/lib/types/cms.ts` (Ministry, PageBlock, PageMedia, Sermon, Podcast, MinistryMember) + `Profile.role` expandido en database.ts
- [x] `src/hooks/use-user.ts` — expone role, ministries, isPastor, isLeader, canManage(slug); isAdmin = pastor|admin (backward compatible)
- [x] `src/app/api/me/route.ts` — join con ministry_members, retorna assignments
- [x] Sidebar con link "Ministerios" condicional por rol (pastor/admin/lider_ministerio)
- [ ] PENDIENTE: asignar roles reales en produccion (Morris → pastor; lideres → lider_ministerio + fila en ministry_members)

**Fase 3b: Block Editor + Ministry Pages (COMPLETADA 2026-06-11)**
- [x] API routes: `/api/cms/blocks`, `/api/cms/blocks/[id]`, `/api/cms/blocks/reorder`, `/api/cms/media`, `/api/ministries`
- [x] Componentes CMS: `block-editor.tsx` (con @dnd-kit, incluye SortableBlockRow), `block-form.tsx` (tabs ES/EN, campos por tipo), `block-renderer.tsx` (9 tipos, estilo iglesia)
- [x] Media picker modal (`media-picker.tsx`): upload a bucket `cms-media` (publico) + seleccion
- [x] Hub pages: `/(app)/ministerios` (grid por rol), `/(app)/ministerios/[slug]` (overview), `/(app)/ministerios/[slug]/contenido` (block editor)
- [x] Rendering publico dinamico: `dynamic-blocks.tsx` (fetch bloques published + BlockRenderer)
- [x] Fallback: pagina sin bloques publicados → muestra contenido hardcodeado actual (las 5 paginas de ministerio publicas envueltas en `<DynamicBlocks>`)
- [x] Sidebar: link "Ministerios" visible solo para pastor/admin/lider_ministerio
- **Permisos de edicion**: paginas `ministerios/<slug>` → requireMinistryAccess(slug); el resto → solo pastor/admin
- **Storage**: bucket `cms-media` (publico) creado en produccion; tabla `page_media` registra cada upload

**Fase 3c: Sermons + Podcasts**
- [ ] Tablas `sermons` + `podcasts` con seed de datos actuales
- [ ] API routes: `/api/sermons`, `/api/sermons/[slug]`, `/api/podcasts`
- [ ] Hub: CRUD de sermones (agregar YouTube link + notas blog)
- [ ] Hub: CRUD de podcasts
- [ ] Publico: `/iglesia/sermones` → fetch de API en vez de array hardcodeado
- [ ] Publico: `/iglesia/sermones/[slug]` → reemplaza 3 paginas estaticas con una dinamica

**Fase 3d: Ministry Events + Calendar**
- [ ] Filtro `?ministry=slug` en GET /api/events
- [ ] Lider_ministerio puede crear eventos draft para su ministerio
- [ ] Solo pastor/admin aprueba → published
- [ ] Hub: `/(app)/ministerios/[slug]/eventos`

**Fase 3e: CMS Global (paginas no-ministerio)**
- [ ] Hub: `/(app)/contenido` — lista de todas las paginas editables
- [ ] Hub: `/(app)/contenido/[pageSlug]` — block editor generico
- [ ] Migrar nosotros, donar, contacto, testimonios a bloques dinamicos

#### Patrones existentes a reusar

| Patron | Archivo referencia | Para que |
|--------|-------------------|----------|
| CRUD API + auth | `src/app/api/events/route.ts` | Todos los nuevos endpoints |
| Drag-and-drop | `src/app/(app)/programas/[id]/page.tsx` | Reordenar bloques |
| Admin UI (forms, cards) | `src/app/(app)/eventos/page.tsx` | Formularios inline, badges |
| Supabase admin client | `src/lib/supabase/admin.ts` | Bypass RLS en todas las APIs |
| useUser() hook | `src/hooks/use-user.ts` | Auth state + role checks |
| FadeIn + diseno iglesia | `src/components/iglesia/fade-in.tsx` | Renderizado publico de bloques |

### Fase 4: Seguridad avanzada
- [ ] Verificacion de email (Supabase lo soporta nativamente)
- [ ] Verificacion de mobile (SMS via Supabase + Twilio)

### Fase 5: Mejoras futuras
- [ ] Dashboard post-login con acceso a ministerios
- [ ] Mover rutas de musica bajo `/musica/*`
- [ ] Soporte Espanol/Ingles en plataforma hub (~24 archivos)
- [ ] Preferencia de idioma en perfil de usuario
- [ ] Testimonios: conectar a datos reales + paginas individuales
- [ ] Donar: integrar plataforma de pagos online (Stripe/PayPal)
- [ ] Contacto: backend real para formulario (actualmente usa mailto)
- [ ] Fotos reales de la iglesia (reemplazar stock photos)
- [ ] SEO: meta tags por pagina, OpenGraph images, sitemap.xml
- [ ] Performance: Next.js Image component (actualmente usa `<img>` tags)
