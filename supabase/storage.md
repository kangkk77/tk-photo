# Supabase Storage Design

## Bucket

Use a single bucket named `photos`.

## Recommended Visibility

For the Phase 4B upload flow, the bucket should be created as public.

Reason:

1. the storage path needs a simple MVP rule for reading uploaded originals
2. the public exhibition pages still remain on local static assets for now
3. future preview delivery can still move toward generated derivatives later

## Path Format

Store original uploads with this path convention:

`userId/albumId/photoId-original.jpg`

Example:

`0f7c2f2b-aaaa-bbbb-cccc-123456789abc/5db2d2aa-1111-2222-3333-abcdefabcdef/9e15d4f1-9999-8888-7777-fedcbafedcba-original.jpg`

## Why This Structure

1. `userId` keeps each uploader's files naturally partitioned
2. `albumId` groups files by album without relying on mutable titles
3. `photoId` prevents filename collisions
4. the `-original` suffix leaves room for later derivatives

## Future Derivatives

Later versions can add additional generated assets in the same folder:

- `photoId-medium.jpg`
- `photoId-thumb.jpg`

Recommended future pattern:

`userId/albumId/photoId-medium.jpg`

`userId/albumId/photoId-thumb.jpg`

## Implementation Note

The current public site still uses local static images under `public/images`.

This storage design is only for the V2 admin upload flow and should not replace
the current static image pipeline yet.
