import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AlbumTheme } from '../types'
import type { AlbumRow, DatabaseAlbumVisibility } from '../types/database'
import {
  createAlbum,
  deleteAlbum,
  listMyAlbums,
} from '../services/albumRepository'

const themeOptions: { value: AlbumTheme; label: string }[] = [
  { value: 'seascape', label: 'Seascape' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'city', label: 'City' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'travel', label: 'Travel' },
  { value: 'daily', label: 'Daily' },
  { value: 'other', label: 'Other' },
]

interface AlbumFormState {
  title: string
  subtitle: string
  description: string
  theme: '' | AlbumTheme
  date: string
  location: string
  visibility: DatabaseAlbumVisibility
}

const initialFormState: AlbumFormState = {
  title: '',
  subtitle: '',
  description: '',
  theme: '',
  date: '',
  location: '',
  visibility: 'public',
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.trim()
  ) {
    return error.message
  }

  return fallbackMessage
}

function AdminAlbumsPanel() {
  const [albums, setAlbums] = useState<AlbumRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState<AlbumFormState>(initialFormState)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingAlbumId, setDeletingAlbumId] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadAlbums = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)

        const results = await listMyAlbums()

        if (!isActive) {
          return
        }

        setAlbums(results)
      } catch (error) {
        if (!isActive) {
          return
        }

        setErrorMessage(getErrorMessage(error, 'Unable to load your albums.'))
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadAlbums()

    return () => {
      isActive = false
    }
  }, [])

  const handleCreateAlbum = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsCreating(true)
      setErrorMessage(null)

      const createdAlbum = await createAlbum({
        title: formState.title,
        subtitle: formState.subtitle,
        description: formState.description,
        theme: formState.theme || null,
        date: formState.date,
        location: formState.location,
        visibility: formState.visibility,
      })

      setAlbums((currentAlbums) => [createdAlbum, ...currentAlbums])
      setFormState(initialFormState)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to create album.'))
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteAlbum = async (album: AlbumRow) => {
    const confirmed = window.confirm(
      `Delete album "${album.title}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingAlbumId(album.id)
      setErrorMessage(null)
      await deleteAlbum(album.id)
      setAlbums((currentAlbums) =>
        currentAlbums.filter((entry) => entry.id !== album.id),
      )
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to delete album.'))
    } finally {
      setDeletingAlbumId(null)
    }
  }

  return (
    <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] md:gap-x-14 md:pt-10">
      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Create Album
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            Start a new sequence for the upload edition. Cover handling will be
            added later, so this round focuses on metadata only.
          </p>
        </div>

        <form className="space-y-7" onSubmit={handleCreateAlbum}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 md:col-span-2">
              <label
                htmlFor="album-title"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Title
              </label>
              <input
                id="album-title"
                type="text"
                value={formState.title}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    title: event.target.value,
                  }))
                }
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="Album title"
                required
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label
                htmlFor="album-subtitle"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Subtitle
              </label>
              <input
                id="album-subtitle"
                type="text"
                value={formState.subtitle}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    subtitle: event.target.value,
                  }))
                }
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="Optional subtitle"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label
                htmlFor="album-description"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Description
              </label>
              <textarea
                id="album-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    description: event.target.value,
                  }))
                }
                className="min-h-32 w-full border border-subtle bg-canvas px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="A short curatorial note for this sequence"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="album-theme"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Theme
              </label>
              <select
                id="album-theme"
                value={formState.theme}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    theme: event.target.value as '' | AlbumTheme,
                  }))
                }
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
              >
                <option value="">None yet</option>
                {themeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="album-visibility"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Visibility
              </label>
              <select
                id="album-visibility"
                value={formState.visibility}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    visibility: event.target.value as DatabaseAlbumVisibility,
                  }))
                }
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="space-y-3">
              <label
                htmlFor="album-date"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Date
              </label>
              <input
                id="album-date"
                type="text"
                value={formState.date}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    date: event.target.value,
                  }))
                }
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="2026-05-04"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="album-location"
                className="text-xs uppercase tracking-[0.28em] text-muted"
              >
                Location
              </label>
              <input
                id="album-location"
                type="text"
                value={formState.location}
                onChange={(event) =>
                  setFormState((currentState) => ({
                    ...currentState,
                    location: event.target.value,
                  }))
                }
                className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                placeholder="Where the sequence was made"
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="space-y-2 border-t border-subtle pt-5">
              <p className="text-xs uppercase tracking-[0.28em] text-muted">
                Panel Error
              </p>
              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {errorMessage}
              </p>
            </div>
          ) : null}

          <div className="border-t border-subtle pt-6">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-w-36 items-center justify-center border border-subtle px-5 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
            >
              {isCreating ? 'Creating...' : 'Create Album'}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-6 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            My Albums
          </p>
          <p className="text-sm leading-8 text-soft md:text-base">
            Existing albums created by the current account.
          </p>
        </div>

        {loading ? (
          <p className="text-sm leading-8 text-soft md:text-base">
            Loading your albums...
          </p>
        ) : errorMessage && albums.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              Unable to load albums.
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : albums.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              No albums yet.
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              Create the first private or public sequence from the form on the
              left.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {albums.map((album) => (
              <article
                key={album.id}
                className="space-y-4 border-t border-subtle pt-5 first:border-t-0 first:pt-0"
              >
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl leading-tight text-ink">
                    {album.title}
                  </h2>
                  <p className="text-sm tracking-[0.08em] text-muted">
                    {(album.subtitle ?? 'No subtitle') + ' / ' + album.visibility}
                  </p>
                </div>

                <div className="space-y-2 text-sm leading-7 text-soft">
                  <p>{album.description ?? 'No description yet.'}</p>
                  <p>{album.date ?? 'No date set'}</p>
                  <p>{album.location ?? 'No location set'}</p>
                </div>

                <button
                  type="button"
                  disabled={deletingAlbumId === album.id}
                  onClick={() => void handleDeleteAlbum(album)}
                  className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                >
                  {deletingAlbumId === album.id ? 'Deleting...' : 'Delete'}
                </button>
              </article>
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}

export default AdminAlbumsPanel
