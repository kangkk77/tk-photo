# T&K Photo V2 Architecture Review

Last updated: 2026-05-04
Branch: `v2-upload`

## Core Review Conclusions

### 1. Missing data access abstraction is the highest-risk architecture issue

The current V1 pages read data synchronously by importing `albums` directly from `src/data/albums.ts`.

This is acceptable for the static V1 site, but it becomes the main migration risk for V2. If the page layer continues to depend on static files directly, the later transition from local data to Supabase will force broad page-level refactors across the public site.

Conclusion:

V2 must establish a unified data access layer first, even while the real source remains static `albums.ts`.

### 2. Do not over-design authorization in the MVP

V2 MVP should not start with `album_members`, multi-level collaboration roles, or complex RLS rules.

Recommended MVP rule:

- use `created_by = auth.uid()`
- each user manages only the albums and photos they created
- keep policies minimal and easy to debug

Conclusion:

Authorization should start simple, then expand only after the upload flow is stable.

### 3. Do not split EXIF into a separate table for V2 MVP

For a two-person site with a limited photo volume, splitting EXIF into a dedicated `photo_exif` table adds complexity without enough practical benefit.

Recommended MVP approach:

- store EXIF fields directly on the `photos` table
- keep the model flat and operationally simple

Conclusion:

V2 MVP should prefer a simpler `photos` schema over a more normalized but heavier design.

## Recommended Phase Order

### Phase 1

Data access layer abstraction

### Phase 2

Supabase infrastructure

### Phase 3

Authentication and studio routes

### Phase 4

Album management and photo upload

### Phase 5

Public exhibition pages switch to Supabase

### Phase 6

V1 data migration and V2 launch

### Phase 7

Optional EXIF Edge Function

## Current Round Scope

This round is Phase 1 only.

Goals:

1. Remove direct page-level dependency on `src/data/albums.ts`
2. Introduce a unified gallery service layer
3. Keep the current source static
4. Make all service APIs asynchronous
5. Preserve current public exhibition visuals and routing behavior
