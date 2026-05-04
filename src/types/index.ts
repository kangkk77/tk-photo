export type ImageRelativePath = `${string}/${string}`

export type AlbumTheme =
  | 'seascape'
  | 'sunset'
  | 'city'
  | 'portrait'
  | 'travel'
  | 'daily'
  | 'other'

export type PhotoOrientation = 'landscape' | 'portrait' | 'square'

export type PhotoLayout = 'full' | 'half' | 'large'

export interface Photo {
  id: string
  albumId: string
  title: string
  description: string
  note?: string
  image: string
  date: string
  location: string
  camera: string
  lens: string
  aperture: string
  shutterSpeed: string
  iso: number
  focalLength: string
  orientation: PhotoOrientation
  layout: PhotoLayout
}

export interface Album {
  id: string
  title: string
  subtitle: string
  description: string
  coverImage: string
  theme: AlbumTheme
  date: string
  location: string
  photos: Photo[]
}

export interface SiteAuthor {
  name: string
  role: string
}

export interface SiteConfig {
  title: string
  subtitle: string
  description: string
  authors: SiteAuthor[]
  cameras: string[]
  lenses: string[]
}
