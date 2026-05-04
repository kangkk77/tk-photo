# T&K Photo Progress

Last updated: 2026-05-04

## Current Status

The project is now live on GitHub Pages as a static online photography exhibition.

Live site:
- `https://kangkk77.github.io/tk-photo/`

Build status:
- `npm run build` passes

## V2 Upload Branch Status

Branch:
- `v2-upload`

Current focus:
- V2 Phase 5 preparation: public exhibition page data migration

### V2 Phase 1: Data Access Layer Abstraction

Completed:
- Added `V2_ARCHITECTURE_REVIEW.md`
- Added `src/services/galleryService.ts`
- Implemented async gallery service functions:
  - `getAlbums()`
  - `getFeaturedAlbums(limit?: number)`
  - `getAlbumById(albumId: string)`
  - `getPhotoById(albumId: string, photoId: string)`
  - `getAdjacentPhotos(albumId: string, photoId: string)`
- Kept `src/data/albums.ts` as the current source of truth
- Updated public pages to stop importing `albums` directly:
  - `HomePage`
  - `AlbumListPage`
  - `AlbumDetailPage`
  - `PhotoDetailPage`
- Added `loading`, `error`, and `not found` handling to the page-level data flow
- Preserved current `HashRouter`, `getImagePath()` rules, visual components, and photo paths

Verification:
- `npm run build` passed

### V2 Phase 2: Supabase Infrastructure Preparation

Completed:
- Installed `@supabase/supabase-js`
- Added `.env.example`
- Updated `.gitignore` to ignore local `.env` files while keeping `.env.example`
- Added `src/lib/supabaseClient.ts`
- Added typed Supabase database draft definitions in `src/types/database.ts`
- Added `supabase/schema.sql`
- Added `supabase/storage.md`
- Prepared minimal V2 MVP schema with:
  - `profiles`
  - `albums`
  - `photos`
- Kept EXIF fields directly on `photos`
- Enabled RLS on all three tables
- Added simple ownership-based policies:
  - public can read public albums and their photos
  - authenticated users can create their own albums
  - authenticated users can update and delete their own albums
  - authenticated users can create, update, and delete photos inside their own albums
- Kept `galleryService` on static `src/data/albums.ts`
- Did not add login pages, upload pages, or Supabase-powered public page reads yet

Verification:
- `npm run build` passed

### V2 Phase 3: Authentication And Protected Studio Routes

Completed:
- Added `src/services/authService.ts`
- Implemented auth service functions:
  - `getCurrentUser()`
  - `signInWithEmail(email, password)`
  - `signOut()`
  - `onAuthStateChange(callback)`
- Added `src/hooks/useAuth.ts`
- Added app-level auth provider with:
  - `user`
  - `loading`
  - `isAuthenticated`
  - `signIn`
  - `signOut`
- Added `src/components/ProtectedRoute.tsx`
- Added `src/pages/LoginPage.tsx`
- Added `src/pages/AdminPage.tsx`
- Added `/login` route
- Added protected `/admin` route
- Redirected unauthenticated `/admin` access to `/login`
- Redirected authenticated `/login` access to `/admin`
- Updated `Header` to show:
  - `Login` entry when signed out
  - `Admin` entry and `Sign Out` action when signed in
- Kept public exhibition pages on their existing static data flow
- Kept `HashRouter` unchanged

Verification:
- `npm run build` passed

### V2 Phase 4A: Admin Album Management

Completed:
- Added `src/services/albumRepository.ts`
- Implemented Supabase album repository functions:
  - `listMyAlbums()`
  - `createAlbum(input)`
  - `updateAlbum(id, input)`
  - `deleteAlbum(id)`
- Ensured album mutations use the current authenticated user id as `created_by`
- Added `src/components/AdminAlbumsPanel.tsx`
- Updated `AdminPage` to show:
  - current signed-in user email
  - album creation form
  - current user's album list
  - delete action for owned albums
- Added `loading`, `error`, and `empty` states for admin album management
- Kept `cover_image` optional for now
- Did not add photo upload yet
- Did not change public exhibition page data sources

Verification:
- `npm run build` passed

### V2 Phase 4B: Admin Photo Upload, EXIF Extraction, And Storage Integration

Completed:
- Reused the existing `exifr` dependency for browser-side EXIF parsing
- Added `src/utils/exif.ts`
- Implemented `parseImageExif(file)` with graceful fallback when EXIF parsing fails
- Added `src/services/photoRepository.ts`
- Implemented Supabase photo repository functions:
  - `listPhotosByAlbum(albumId)`
  - `uploadPhotoToAlbum(albumId, file, metadata)`
  - `deletePhoto(photoId)`
- Added `supabase/storage-policies.sql`
- Documented public bucket and path expectations for the V2 upload flow
- Kept Storage uploads in the `photos` bucket with this path structure:
  - `userId/albumId/photoId-original.ext`
- Kept `photos.image_path` as the Storage path only, without storing a full public URL
- Updated `src/types/database.ts` exports for Supabase photo insert and update types
- Added `src/components/AdminPhotoUploadPanel.tsx`
- Updated `AdminAlbumsPanel` so each owned album now includes:
  - single-photo upload form
  - filename preview
  - loading, error, and empty states
  - uploaded photo list with EXIF metadata
  - delete action for uploaded photos
- Updated `AdminPage` copy to reflect the new storage-backed photo workflow
- Kept public exhibition pages on their current static data source

Verification:
- `npm run build` passed

### V2 Phase 4C: Portfolio And Photo Management Refinement

Completed:
- Added `supabase/migrations/add_photo_note.sql`
- Updated `supabase/schema.sql` so new environments include `photos.note`
- Added `note` to the Supabase front-end database draft types
- Extended `albumRepository` with:
  - safe `updateAlbum(id, input)` behavior that no longer clears `cover_image` unless explicitly provided
  - `setAlbumCover(albumId, imagePath)`
- Extended `photoRepository` with:
  - `updatePhoto(photoId, input)`
  - support for `note`, `date`, `location`, and `layout` updates without touching EXIF fields
- Upgraded `AdminAlbumsPanel` with:
  - Chinese admin copy
  - album edit flow
  - save, cancel, success, and error states
  - live album cover status
- Upgraded `AdminPhotoUploadPanel` with:
  - Chinese admin copy
  - photo edit flow
  - note textarea for photo essays and stories
  - description and note summaries in the list
  - EXIF summary display
  - set-as-cover action
  - cover cleanup when deleting the current cover photo
- Updated the admin dashboard copy to match the refined studio workflow

Manual step required:
- Existing Supabase projects need `supabase/migrations/add_photo_note.sql` executed in the SQL Editor to add `public.photos.note`

Verification:
- `npm run build` passed

## Completed Phases

### Phase 1: Project Foundation

Completed:
- Vite + React + TypeScript scaffold
- Tailwind CSS base setup
- `HashRouter` routing
- Core layout components:
  - `Layout`
  - `Header`
  - `Footer`
  - `BackButton`
- Base pages scaffold:
  - `HomePage`
  - `AlbumListPage`
  - `AlbumDetailPage`
  - `PhotoDetailPage`
  - `AboutPage`
- `getImagePath(relativePath)`
- `vite.config.ts`
  - dev `base` = `/`
  - prod `base` = `/tk-photo/`

Verification:
- `npm run build` passed

### Phase 2: Types and Static Data

Completed:
- `src/types/index.ts`
- Core types:
  - `AlbumTheme`
  - `PhotoOrientation`
  - `PhotoLayout`
  - `Photo`
  - `Album`
  - `SiteConfig`
- Static data files:
  - `src/data/site.ts`
  - `src/data/albums.ts`
- Exhibition-style album data structure
- Image paths stored only as relative path fragments
- Matching image directories under `public/images`

Verification:
- TypeScript checks passed
- `npm run build` passed

### Phase 3: Home Page Visual Direction

Completed:
- `GalleryHero`
- `AlbumCard`
- `AlbumGrid`
- `HomePage`
- Homepage exhibition-style hero
- Selected albums section
- Staggered album layout
- Framer Motion fade-in and subtle hover scale
- Mobile-safe layout

Verification:
- `npm run build` passed

### Phase 4: Album Index Page

Completed:
- `/albums`
- `AlbumListPage`
- Reverse chronological album order
- Reused `AlbumGrid` and `AlbumCard`
- Serif title and restrained exhibition-directory layout

Verification:
- `npm run build` passed

### Phase 5: Album Detail Page

Completed:
- `/albums/:albumId`
- `AlbumDetailPage`
- `PhotoWall`
- `MotionImage`
- Album lookup via route params
- Elegant not-found state for invalid album ids
- Exhibition-style staggered photo wall
- Photo click-through to `/albums/:albumId/:photoId`
- Image fallback state that keeps layout stable

Verification:
- `npm run build` passed

### Phase 6: Photo Detail Page

Completed:
- `/albums/:albumId/:photoId`
- `PhotoDetailPage`
- `PhotoDetail`
- `ExifPanel`
- Route lookup for both album id and photo id
- Elegant not-found state for invalid album ids or photo ids
- Large photo as the visual focus
- EXIF metadata panel with restrained hierarchy
- Previous / next navigation
- Keyboard navigation:
  - `ArrowLeft`
  - `ArrowRight`
  - `Escape`
- Mobile-safe top-image / bottom-info layout

Verification:
- `npm run build` passed

### Phase 6.5: Real Photo And EXIF Integration

Completed:
- Connected real photos into the site collection
- Generated `EXIF_REPORT.md`
- Replaced example EXIF values in `src/data/albums.ts` with real camera data where available
- Kept image path fragments unchanged

Verification:
- `npm run build` passed

### Phase 7: Theme And Global Polish

Completed:
- Added light / dark theme toggle
- Persisted theme choice in `localStorage`
- Restored saved theme on refresh before React hydration
- Added route-level not-found page
- Refined shared borders and theme variables for better dark-mode consistency
- Added reduced-motion support for Framer Motion and CSS transitions
- Improved `AboutPage` from placeholder content to exhibition information
- Updated `index.html` metadata:
  - `title`
  - `meta description`
  - `viewport`
  - basic Open Graph tags

Verification:
- `npm run build` passed

### Deployment Preparation: GitHub Pages Workflow

Completed:
- Created `.github/workflows/deploy.yml`
- Configured official GitHub Pages Actions workflow
- Trigger set to push on `main`
- Node.js version pinned to 20
- `npm ci` used for dependency installation
- `npm run build` used for production build
- `dist/` uploaded through Pages artifact
- Deployment configured with `actions/deploy-pages`
- Confirmed `package-lock.json` exists for `npm ci`

Verification:
- `npm run build` passed

### Release Acceptance: GitHub Pages Live

Completed:
- Verified the project is reachable on GitHub Pages
- Confirmed the production site uses the configured `/tk-photo/` base path
- Confirmed deployment workflow is in place and the live URL resolves
- Updated repository documentation for local development, build, deployment, and content updates
- Reviewed repository hygiene for temporary scaffold files and unused image assets

Verification:
- Live site available at `https://kangkk77.github.io/tk-photo/`
- `npm run build` passed

## Current Rules

These rules must continue to be followed:

1. Use `HashRouter`
2. Never store image paths as `/images/...` in data files
3. Store only relative image path fragments such as `stone-and-eaves/pagoda-rise.jpg`
4. Always resolve image URLs in components with `getImagePath()`
5. Dev `base` is `/`
6. Prod `base` is `/tk-photo/`
7. Visual direction must follow `VISUAL_DESIGN.md`
8. Keep the public exhibition stable while V2 upload and admin work continues on `v2-upload`
9. Photos must stay square-free, without rounded corners and without shadows
10. Motion must stay restrained and limited to fade-in and slight scale
11. Run `npm run build` after each completed round

## Current Scope

Implemented:
- Project foundation
- Static data structure
- Home page visual system
- Album index page
- Album detail page with exhibition wall
- Photo detail page with EXIF panel
- Real photo integration
- Real EXIF metadata integration
- Theme toggle and persisted theme preference
- Route-level not-found page
- Reduced-motion support
- About page exhibition content
- GitHub Pages deployment workflow
- Live GitHub Pages deployment

Not fully implemented yet:
- Supabase-backed public exhibition page reads
- Photo preview and thumbnail generation
- Multi-photo upload
- Drag-and-drop upload
- Complex collaboration roles
- Comments, likes, favorites
- Download actions

## Next Phase

### Next Candidate Phase

Goal:
- Switch public exhibition page reads from static album data to Supabase while preserving the V1 exhibition presentation

Out of scope for this phase:
- Complex collaboration roles
- Public page redesign
- Comments, likes, favorites
