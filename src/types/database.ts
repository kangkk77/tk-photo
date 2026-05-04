import type {
  AlbumTheme,
  PhotoLayout,
  PhotoOrientation,
} from './index'

export type DatabaseAlbumVisibility = 'public' | 'private'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      albums: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string | null
          cover_image: string | null
          theme: AlbumTheme | null
          date: string | null
          location: string | null
          visibility: DatabaseAlbumVisibility
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          description?: string | null
          cover_image?: string | null
          theme?: AlbumTheme | null
          date?: string | null
          location?: string | null
          visibility?: DatabaseAlbumVisibility
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          cover_image?: string | null
          theme?: AlbumTheme | null
          date?: string | null
          location?: string | null
          visibility?: DatabaseAlbumVisibility
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'albums_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      photos: {
        Row: {
          id: string
          album_id: string
          title: string | null
          description: string | null
          image_path: string
          date: string | null
          location: string | null
          camera: string | null
          lens: string | null
          aperture: string | null
          shutter_speed: string | null
          iso: number | null
          focal_length: string | null
          orientation: PhotoOrientation | null
          layout: PhotoLayout | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          album_id: string
          title?: string | null
          description?: string | null
          image_path: string
          date?: string | null
          location?: string | null
          camera?: string | null
          lens?: string | null
          aperture?: string | null
          shutter_speed?: string | null
          iso?: number | null
          focal_length?: string | null
          orientation?: PhotoOrientation | null
          layout?: PhotoLayout | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          title?: string | null
          description?: string | null
          image_path?: string
          date?: string | null
          location?: string | null
          camera?: string | null
          lens?: string | null
          aperture?: string | null
          shutter_speed?: string | null
          iso?: number | null
          focal_length?: string | null
          orientation?: PhotoOrientation | null
          layout?: PhotoLayout | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'photos_album_id_fkey'
            columns: ['album_id']
            isOneToOne: false
            referencedRelation: 'albums'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'photos_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type AlbumRow = Database['public']['Tables']['albums']['Row']
export type PhotoRow = Database['public']['Tables']['photos']['Row']
export type AlbumInsert = Database['public']['Tables']['albums']['Insert']
export type AlbumUpdate = Database['public']['Tables']['albums']['Update']
