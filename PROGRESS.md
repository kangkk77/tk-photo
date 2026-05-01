# T&K Photo Progress

Last updated: 2026-05-01

## Current Status

The project is now in the static showcase phase for a GitHub Pages photography site.

Build status:
- `npm run build` passes

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
- 2 sample albums
- 3 sample photos per album
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

### Phase 5.5: Real Photo Integration

Completed:
- Connected 3 real test photos to `golden-coast`
- Saved real images under `public/images/golden-coast/`
- Reused one real image as `cover.jpg`
- Updated `src/data/albums.ts` so homepage, `/albums`, and `/albums/golden-coast` all render real photos
- Kept data paths as relative fragments only

Saved image files:
- `public/images/golden-coast/cover.jpg`
- `public/images/golden-coast/coast-shadow.jpg`
- `public/images/golden-coast/sea-light.jpg`
- `public/images/golden-coast/sunset-rock.jpg`

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

### Phase 6.5: Real EXIF Integration

Completed:
- Read EXIF metadata from the real `golden-coast` image files
- Generated `EXIF_REPORT.md` as a local verification report
- Replaced example EXIF values in `src/data/albums.ts` with real camera data
- Kept image path fragments unchanged
- Preserved existing page structure and styles

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

## Current Rules

These rules must continue to be followed:

1. Use `HashRouter`
2. Never store image paths as `/images/...` in data files
3. Store only relative image path fragments such as `golden-coast/cover.jpg`
4. Always resolve image URLs in components with `getImagePath()`
5. Dev `base` is `/`
6. Prod `base` is `/tk-photo/`
7. Visual direction must follow `VISUAL_DESIGN.md`
8. Do not build login, database, upload, Supabase, or admin features in this version
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
- Real test photo integration
- Photo detail page with EXIF panel
- Real EXIF metadata integration
- Theme toggle and persisted theme preference
- Route-level not-found page
- Reduced-motion support
- About page exhibition content
- GitHub Pages deployment workflow

Not implemented yet:
- GitHub repository-side Pages setting activation

## Next Phase

### Next Candidate Phase

Goal:
- Activate GitHub Pages in repository settings and verify the first production deployment

Out of scope for this phase:
- Login
- Upload
- Database
- Supabase
- Download
- Comments, likes, favorites
