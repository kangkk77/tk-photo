import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useI18n } from '../hooks/useI18n'
import {
  createAlbum,
  deleteAlbum,
  listMyAlbums,
  updateAlbum,
} from '../services/albumRepository'
import type { AlbumTheme } from '../types'
import type { AlbumRow, DatabaseAlbumVisibility } from '../types/database'
import AdminPhotoUploadPanel from './AdminPhotoUploadPanel'

interface AlbumFormState {
  title: string
  subtitle: string
  description: string
  theme: '' | AlbumTheme
  date: string
  location: string
  visibility: DatabaseAlbumVisibility
}

interface AlbumFormFieldsProps {
  formState: AlbumFormState
  idPrefix: string
  onFieldChange: (field: keyof AlbumFormState, value: string) => void
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

function createFormStateFromAlbum(album: AlbumRow): AlbumFormState {
  return {
    title: album.title,
    subtitle: album.subtitle ?? '',
    description: album.description ?? '',
    theme: album.theme ?? '',
    date: album.date ?? '',
    location: album.location ?? '',
    visibility: album.visibility,
  }
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
  const { t } = useI18n()
  const [albums, setAlbums] = useState<AlbumRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formState, setFormState] = useState<AlbumFormState>(initialFormState)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingAlbumId, setDeletingAlbumId] = useState<string | null>(null)
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null)
  const [editFormState, setEditFormState] =
    useState<AlbumFormState>(initialFormState)
  const [savingAlbumId, setSavingAlbumId] = useState<string | null>(null)

  const themeOptions: { value: AlbumTheme; label: string }[] = useMemo(
    () => [
      { value: 'seascape', label: t('albumsPanel.theme.seascape') },
      { value: 'sunset', label: t('albumsPanel.theme.sunset') },
      { value: 'city', label: t('albumsPanel.theme.city') },
      { value: 'portrait', label: t('albumsPanel.theme.portrait') },
      { value: 'travel', label: t('albumsPanel.theme.travel') },
      { value: 'daily', label: t('albumsPanel.theme.daily') },
      { value: 'other', label: t('albumsPanel.theme.other') },
    ],
    [t],
  )

  const visibilityOptions: {
    value: DatabaseAlbumVisibility
    label: string
  }[] = useMemo(
    () => [
      { value: 'public', label: t('albumsPanel.visibility.public') },
      { value: 'private', label: t('albumsPanel.visibility.private') },
    ],
    [t],
  )

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

        const message = getErrorMessage(
          error,
          t('common.status.somethingWentWrong'),
        )
        setErrorMessage(t('albumsPanel.loadError', { message }))
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
  }, [t])

  const handleCreateFieldChange = (
    field: keyof AlbumFormState,
    value: string,
  ) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  const handleEditFieldChange = (
    field: keyof AlbumFormState,
    value: string,
  ) => {
    setEditFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  const handleAlbumUpdated = (updatedAlbum: AlbumRow) => {
    setAlbums((currentAlbums) =>
      currentAlbums.map((entry) =>
        entry.id === updatedAlbum.id ? updatedAlbum : entry,
      ),
    )
  }

  const handleCreateAlbum = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsCreating(true)
      setErrorMessage(null)
      setSuccessMessage(null)

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
      setSuccessMessage(
        t('albumsPanel.createSuccess', { title: createdAlbum.title }),
      )
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('albumsPanel.createError', { message }))
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEditAlbum = (album: AlbumRow) => {
    setEditingAlbumId(album.id)
    setEditFormState(createFormStateFromAlbum(album))
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleCancelEditAlbum = () => {
    setEditingAlbumId(null)
    setEditFormState(initialFormState)
  }

  const handleSaveAlbum = async (
    event: FormEvent<HTMLFormElement>,
    album: AlbumRow,
  ) => {
    event.preventDefault()

    try {
      setSavingAlbumId(album.id)
      setErrorMessage(null)
      setSuccessMessage(null)

      const updatedAlbum = await updateAlbum(album.id, {
        title: editFormState.title,
        subtitle: editFormState.subtitle,
        description: editFormState.description,
        theme: editFormState.theme || null,
        date: editFormState.date,
        location: editFormState.location,
        visibility: editFormState.visibility,
      })

      handleAlbumUpdated(updatedAlbum)
      setEditingAlbumId(null)
      setEditFormState(initialFormState)
      setSuccessMessage(
        t('albumsPanel.updateSuccess', { title: updatedAlbum.title }),
      )
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('albumsPanel.updateError', { message }))
    } finally {
      setSavingAlbumId(null)
    }
  }

  const handleDeleteAlbum = async (album: AlbumRow) => {
    const confirmed = window.confirm(
      t('albumsPanel.deleteConfirm', { title: album.title }),
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingAlbumId(album.id)
      setErrorMessage(null)
      setSuccessMessage(null)
      await deleteAlbum(album.id)
      setAlbums((currentAlbums) =>
        currentAlbums.filter((entry) => entry.id !== album.id),
      )
      setSuccessMessage(t('albumsPanel.deleteSuccess', { title: album.title }))
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('albumsPanel.deleteError', { message }))
    } finally {
      setDeletingAlbumId(null)
    }
  }

  const renderAlbumFormFields = ({
    formState: currentFormState,
    idPrefix,
    onFieldChange,
  }: AlbumFormFieldsProps) => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor={`${idPrefix}-title`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.title')}
        </label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={currentFormState.title}
          onChange={(event) => onFieldChange('title', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder={t('albumsPanel.form.titlePlaceholder')}
          required
        />
      </div>

      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor={`${idPrefix}-subtitle`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.subtitle')}
        </label>
        <input
          id={`${idPrefix}-subtitle`}
          type="text"
          value={currentFormState.subtitle}
          onChange={(event) => onFieldChange('subtitle', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder={t('albumsPanel.form.subtitlePlaceholder')}
        />
      </div>

      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor={`${idPrefix}-description`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.description')}
        </label>
        <textarea
          id={`${idPrefix}-description`}
          value={currentFormState.description}
          onChange={(event) => onFieldChange('description', event.target.value)}
          className="min-h-32 w-full border border-subtle bg-canvas px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder={t('albumsPanel.form.descriptionPlaceholder')}
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-theme`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.theme')}
        </label>
        <select
          id={`${idPrefix}-theme`}
          value={currentFormState.theme}
          onChange={(event) => onFieldChange('theme', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
        >
          <option value="">{t('albumsPanel.form.themePlaceholder')}</option>
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-visibility`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.visibility')}
        </label>
        <select
          id={`${idPrefix}-visibility`}
          value={currentFormState.visibility}
          onChange={(event) => onFieldChange('visibility', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
        >
          {visibilityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-date`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.date')}
        </label>
        <input
          id={`${idPrefix}-date`}
          type="text"
          value={currentFormState.date}
          onChange={(event) => onFieldChange('date', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder={t('albumsPanel.form.datePlaceholder')}
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-location`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          {t('albumsPanel.form.location')}
        </label>
        <input
          id={`${idPrefix}-location`}
          type="text"
          value={currentFormState.location}
          onChange={(event) => onFieldChange('location', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder={t('albumsPanel.form.locationPlaceholder')}
        />
      </div>
    </div>
  )

  return (
    <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] md:gap-x-14 md:pt-10">
      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumsPanel.createOverline')}
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            {t('albumsPanel.createDescription')}
          </p>
        </div>

        {(errorMessage || successMessage) && (
          <div className="space-y-2 border-t border-subtle pt-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              {t('albumsPanel.status')}
            </p>
            {errorMessage ? (
              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {errorMessage}
              </p>
            ) : null}
            {successMessage ? (
              <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
                {successMessage}
              </p>
            ) : null}
          </div>
        )}

        <form className="space-y-7" onSubmit={handleCreateAlbum}>
          {renderAlbumFormFields({
            formState,
            idPrefix: 'create-album',
            onFieldChange: handleCreateFieldChange,
          })}

          <div className="border-t border-subtle pt-6">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-w-36 items-center justify-center border border-subtle px-5 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
            >
              {isCreating ? t('albumsPanel.creating') : t('albumsPanel.create')}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-6 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumsPanel.listOverline')}
          </p>
          <p className="text-sm leading-8 text-soft md:text-base">
            {t('albumsPanel.listDescription')}
          </p>
        </div>

        {loading ? (
          <p className="text-sm leading-8 text-soft md:text-base">
            {t('albumsPanel.loading')}
          </p>
        ) : errorMessage && albums.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              {t('albumsPanel.loadErrorTitle')}
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : albums.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              {t('albumsPanel.emptyTitle')}
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {t('albumsPanel.emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {albums.map((album) => {
              const visibilityLabel =
                album.visibility === 'public'
                  ? t('albumsPanel.visibility.public')
                  : t('albumsPanel.visibility.private')

              return (
                <article
                  key={album.id}
                  className="space-y-4 border-t border-subtle pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl leading-tight text-ink">
                      {album.title}
                    </h2>
                    <p className="text-sm tracking-[0.08em] text-muted">
                      {(album.subtitle ?? t('albumsPanel.noSubtitle')) +
                        ' / ' +
                        visibilityLabel}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm leading-7 text-soft">
                    <p>{album.description ?? t('albumsPanel.noDescription')}</p>
                    <p>
                      {t('albumsPanel.dateLabel', {
                        value: album.date ?? t('albumsPanel.emptyValue'),
                      })}
                    </p>
                    <p>
                      {t('albumsPanel.locationLabel', {
                        value: album.location ?? t('albumsPanel.emptyValue'),
                      })}
                    </p>
                    <p>
                      {t('albumsPanel.coverLabel', {
                        value: album.cover_image ?? t('albumsPanel.coverUnset'),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartEditAlbum(album)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                    >
                      {t('albumsPanel.editButton')}
                    </button>
                    <button
                      type="button"
                      disabled={deletingAlbumId === album.id}
                      onClick={() => void handleDeleteAlbum(album)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                    >
                      {deletingAlbumId === album.id
                        ? t('albumsPanel.deleting')
                        : t('albumsPanel.deleteButton')}
                    </button>
                  </div>

                  {editingAlbumId === album.id ? (
                    <form
                      className="space-y-6 border-t border-subtle pt-5"
                      onSubmit={(event) => void handleSaveAlbum(event, album)}
                    >
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted">
                          {t('albumsPanel.editOverline')}
                        </p>
                        <p className="text-sm leading-8 text-soft md:text-base">
                          {t('albumsPanel.editDescription')}
                        </p>
                      </div>

                      {renderAlbumFormFields({
                        formState: editFormState,
                        idPrefix: `edit-album-${album.id}`,
                        onFieldChange: handleEditFieldChange,
                      })}

                      <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
                        <button
                          type="submit"
                          disabled={savingAlbumId === album.id}
                          className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                        >
                          {savingAlbumId === album.id
                            ? t('albumsPanel.saving')
                            : t('albumsPanel.save')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditAlbum}
                          className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                        >
                          {t('albumsPanel.cancel')}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <AdminPhotoUploadPanel
                    albumId={album.id}
                    albumTitle={album.title}
                    coverImage={album.cover_image}
                    onAlbumUpdated={handleAlbumUpdated}
                  />
                </article>
              )
            })}
          </div>
        )}
      </aside>
    </div>
  )
}

export default AdminAlbumsPanel
