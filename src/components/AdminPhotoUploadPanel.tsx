import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useI18n } from '../hooks/useI18n'
import { setAlbumCover } from '../services/albumRepository'
import {
  deletePhoto,
  listPhotosByAlbum,
  updatePhoto,
  uploadPhotoToAlbum,
} from '../services/photoRepository'
import type { PhotoLayout } from '../types'
import type { AlbumRow, PhotoRow } from '../types/database'

interface AdminPhotoUploadPanelProps {
  albumId: string
  albumTitle: string
  coverImage: string | null
  onAlbumUpdated?: (album: AlbumRow) => void
}

interface PhotoUploadFormState {
  title: string
  description: string
}

interface PhotoEditFormState {
  title: string
  description: string
  note: string
  date: string
  location: string
  layout: '' | PhotoLayout
}

const initialUploadFormState: PhotoUploadFormState = {
  title: '',
  description: '',
}

const initialEditFormState: PhotoEditFormState = {
  title: '',
  description: '',
  note: '',
  date: '',
  location: '',
  layout: '',
}

function createEditFormState(photo: PhotoRow): PhotoEditFormState {
  return {
    title: photo.title ?? '',
    description: photo.description ?? '',
    note: photo.note ?? '',
    date: photo.date ?? '',
    location: photo.location ?? '',
    layout: photo.layout ?? '',
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

function summarizeText(value: string | null, fallbackText: string) {
  if (!value?.trim()) {
    return fallbackText
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 88
    ? `${trimmedValue.slice(0, 88)}...`
    : trimmedValue
}

function AdminPhotoUploadPanel({
  albumId,
  albumTitle,
  coverImage,
  onAlbumUpdated,
}: AdminPhotoUploadPanelProps) {
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadFormState, setUploadFormState] = useState<PhotoUploadFormState>(
    initialUploadFormState,
  )
  const [isUploading, setIsUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null)
  const [editFormState, setEditFormState] =
    useState<PhotoEditFormState>(initialEditFormState)
  const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null)
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)

  const layoutOptions: { value: PhotoLayout; label: string }[] = useMemo(
    () => [
      { value: 'full', label: t('photoPanel.layout.full') },
      { value: 'half', label: t('photoPanel.layout.half') },
      { value: 'large', label: t('photoPanel.layout.large') },
    ],
    [t],
  )

  useEffect(() => {
    let isActive = true

    const loadPhotos = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)

        const results = await listPhotosByAlbum(albumId)

        if (!isActive) {
          return
        }

        setPhotos(results)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message = getErrorMessage(
          error,
          t('common.status.somethingWentWrong'),
        )
        setErrorMessage(t('photoPanel.loadError', { message }))
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadPhotos()

    return () => {
      isActive = false
    }
  }, [albumId, t])

  const handleUploadFieldChange = (
    field: keyof PhotoUploadFormState,
    value: string,
  ) => {
    setUploadFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  const handleEditFieldChange = (
    field: keyof PhotoEditFormState,
    value: string,
  ) => {
    setEditFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  const formatExifSummary = (photo: PhotoRow) => {
    const parts = [
      photo.camera,
      photo.lens,
      photo.aperture,
      photo.shutter_speed,
      photo.iso ? `ISO ${photo.iso}` : null,
      photo.focal_length,
    ].filter((value): value is string => Boolean(value))

    return parts.length > 0 ? parts.join(' / ') : t('photoPanel.noExif')
  }

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage(t('photoPanel.selectFileFirst'))
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const uploadedPhoto = await uploadPhotoToAlbum(albumId, selectedFile, {
        title: uploadFormState.title,
        description: uploadFormState.description,
      })

      setPhotos((currentPhotos) => [uploadedPhoto, ...currentPhotos])
      setUploadFormState(initialUploadFormState)
      setSelectedFile(null)
      setSuccessMessage(
        t('photoPanel.uploadSuccess', {
          title: uploadedPhoto.title ?? t('photoPanel.untitled'),
        }),
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('photoPanel.uploadError', { message }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleStartEditPhoto = (photo: PhotoRow) => {
    setEditingPhotoId(photo.id)
    setEditFormState(createEditFormState(photo))
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleCancelEditPhoto = () => {
    setEditingPhotoId(null)
    setEditFormState(initialEditFormState)
  }

  const handleSavePhoto = async (
    event: FormEvent<HTMLFormElement>,
    photo: PhotoRow,
  ) => {
    event.preventDefault()

    try {
      setSavingPhotoId(photo.id)
      setErrorMessage(null)
      setSuccessMessage(null)

      const updatedPhoto = await updatePhoto(photo.id, {
        title: editFormState.title,
        description: editFormState.description,
        note: editFormState.note,
        date: editFormState.date,
        location: editFormState.location,
        layout: editFormState.layout || null,
      })

      setPhotos((currentPhotos) =>
        currentPhotos.map((entry) =>
          entry.id === updatedPhoto.id ? updatedPhoto : entry,
        ),
      )
      setEditingPhotoId(null)
      setEditFormState(initialEditFormState)
      setSuccessMessage(
        t('photoPanel.updateSuccess', {
          title: updatedPhoto.title ?? t('photoPanel.untitled'),
        }),
      )
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('photoPanel.updateError', { message }))
    } finally {
      setSavingPhotoId(null)
    }
  }

  const handleSetCover = async (photo: PhotoRow) => {
    if (photo.image_path === coverImage) {
      setSuccessMessage(t('photoPanel.alreadyCover'))
      return
    }

    try {
      setCoverPhotoId(photo.id)
      setErrorMessage(null)
      setSuccessMessage(null)

      const updatedAlbum = await setAlbumCover(albumId, photo.image_path)
      onAlbumUpdated?.(updatedAlbum)
      setSuccessMessage(
        t('photoPanel.setCoverSuccess', {
          title: photo.title ?? t('photoPanel.untitled'),
        }),
      )
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('photoPanel.setCoverError', { message }))
    } finally {
      setCoverPhotoId(null)
    }
  }

  const handleDeletePhoto = async (photo: PhotoRow) => {
    const photoTitle = photo.title ?? photo.image_path
    const confirmed = window.confirm(
      t('photoPanel.deleteConfirm', {
        albumTitle,
        photoTitle,
      }),
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingPhotoId(photo.id)
      setErrorMessage(null)
      setSuccessMessage(null)
      await deletePhoto(photo.id)

      if (photo.image_path === coverImage) {
        try {
          const updatedAlbum = await setAlbumCover(albumId, null)
          onAlbumUpdated?.(updatedAlbum)
        } catch (error) {
          throw new Error(
            t('photoPanel.coverCleanupFailed', {
              message: getErrorMessage(
                error,
                t('common.status.somethingWentWrong'),
              ),
            }),
          )
        }
      }

      setPhotos((currentPhotos) =>
        currentPhotos.filter((entry) => entry.id !== photo.id),
      )
      setSuccessMessage(
        t('photoPanel.deleteSuccess', {
          title: photo.title ?? t('photoPanel.untitled'),
        }),
      )
    } catch (error) {
      const message = getErrorMessage(
        error,
        t('common.status.somethingWentWrong'),
      )
      setErrorMessage(t('photoPanel.deleteError', { message }))
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <section className="space-y-6 border-t border-subtle pt-5">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">
          {t('photoPanel.overline')}
        </p>
        <p className="text-sm leading-8 text-soft md:text-base">
          {t('photoPanel.description')}
        </p>
        <p className="text-sm leading-8 text-soft md:text-base">
          {coverImage
            ? t('photoPanel.currentCoverPath', { path: coverImage })
            : t('photoPanel.currentCoverEmpty')}
        </p>
      </div>

      {(errorMessage || successMessage) && (
        <div className="space-y-2 border-t border-subtle pt-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('albumsPanel.status')}
          </p>
          {errorMessage ? (
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="text-sm leading-8 text-soft md:text-base">
              {successMessage}
            </p>
          ) : null}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleUpload}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 md:col-span-2">
            <label
              htmlFor={`photo-file-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              {t('photoPanel.selectFile')}
            </label>
            <input
              ref={fileInputRef}
              id={`photo-file-${albumId}`}
              type="file"
              accept="image/*"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="block w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink file:mr-4 file:border-0 file:bg-transparent file:px-0 file:py-0 file:text-sm file:text-soft"
            />
            <p className="text-sm leading-7 text-soft">
              {selectedFile
                ? t('photoPanel.selectedFile', { name: selectedFile.name })
                : t('photoPanel.noSelectedFile')}
            </p>
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`photo-title-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              {t('photoPanel.photoTitle')}
            </label>
            <input
              id={`photo-title-${albumId}`}
              type="text"
              value={uploadFormState.title}
              onChange={(event) =>
                handleUploadFieldChange('title', event.target.value)
              }
              className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
              placeholder={t('photoPanel.photoTitlePlaceholder')}
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`photo-description-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              {t('photoPanel.shortDescription')}
            </label>
            <input
              id={`photo-description-${albumId}`}
              type="text"
              value={uploadFormState.description}
              onChange={(event) =>
                handleUploadFieldChange('description', event.target.value)
              }
              className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
              placeholder={t('photoPanel.shortDescriptionPlaceholder')}
            />
          </div>
        </div>

        <div className="border-t border-subtle pt-6">
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
          >
            {isUploading ? t('photoPanel.uploading') : t('photoPanel.upload')}
          </button>
        </div>
      </form>

      <div className="space-y-4 border-t border-subtle pt-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            {t('photoPanel.listOverline')}
          </p>
          <p className="text-sm leading-8 text-soft md:text-base">
            {t('photoPanel.listDescription')}
          </p>
        </div>

        {loading ? (
          <p className="text-sm leading-8 text-soft md:text-base">
            {t('photoPanel.loading')}
          </p>
        ) : errorMessage && photos.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              {t('photoPanel.loadErrorTitle')}
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              {t('photoPanel.emptyTitle')}
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {t('photoPanel.emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {photos.map((photo) => {
              const isCurrentCover = coverImage === photo.image_path

              return (
                <article
                  key={photo.id}
                  className="space-y-4 border-t border-subtle pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-serif text-2xl leading-tight text-ink">
                        {photo.title ?? t('photoPanel.untitled')}
                      </h3>
                      {isCurrentCover ? (
                        <span className="text-xs uppercase tracking-[0.2em] text-muted">
                          {t('photoPanel.currentCover')}
                        </span>
                      ) : null}
                    </div>
                    <p className="break-all text-sm leading-7 text-soft">
                      {photo.image_path}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm leading-7 text-soft">
                    <p>
                      {t('photoPanel.descriptionSummary', {
                        value: summarizeText(
                          photo.description,
                          t('photoPanel.noDescription'),
                        ),
                      })}
                    </p>
                    <p>
                      {t('photoPanel.noteSummary', {
                        value: summarizeText(photo.note, t('photoPanel.noNote')),
                      })}
                    </p>
                    <p>
                      {t('photoPanel.exifSummary', {
                        value: formatExifSummary(photo),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartEditPhoto(photo)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                    >
                      {t('photoPanel.editButton')}
                    </button>
                    <button
                      type="button"
                      disabled={coverPhotoId === photo.id}
                      onClick={() => void handleSetCover(photo)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                    >
                      {coverPhotoId === photo.id
                        ? t('photoPanel.settingCover')
                        : t('photoPanel.setCoverButton')}
                    </button>
                    <button
                      type="button"
                      disabled={deletingPhotoId === photo.id}
                      onClick={() => void handleDeletePhoto(photo)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                    >
                      {deletingPhotoId === photo.id
                        ? t('photoPanel.deleting')
                        : t('photoPanel.deleteButton')}
                    </button>
                  </div>

                  {editingPhotoId === photo.id ? (
                    <form
                      className="space-y-6 border-t border-subtle pt-5"
                      onSubmit={(event) => void handleSavePhoto(event, photo)}
                    >
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted">
                          {t('photoPanel.editOverline')}
                        </p>
                        <p className="text-sm leading-8 text-soft md:text-base">
                          {t('photoPanel.editDescription')}
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3 md:col-span-2">
                          <label
                            htmlFor={`edit-photo-title-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            {t('photoPanel.photoTitle')}
                          </label>
                          <input
                            id={`edit-photo-title-${photo.id}`}
                            type="text"
                            value={editFormState.title}
                            onChange={(event) =>
                              handleEditFieldChange('title', event.target.value)
                            }
                            className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder={t('albumsPanel.form.titlePlaceholder')}
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <label
                            htmlFor={`edit-photo-description-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            {t('common.labels.description')}
                          </label>
                          <textarea
                            id={`edit-photo-description-${photo.id}`}
                            value={editFormState.description}
                            onChange={(event) =>
                              handleEditFieldChange(
                                'description',
                                event.target.value,
                              )
                            }
                            className="min-h-28 w-full border border-subtle bg-canvas px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder={t('albumsPanel.form.descriptionPlaceholder')}
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <label
                            htmlFor={`edit-photo-note-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            {t('photoPanel.noteLabel')}
                          </label>
                          <textarea
                            id={`edit-photo-note-${photo.id}`}
                            value={editFormState.note}
                            onChange={(event) =>
                              handleEditFieldChange('note', event.target.value)
                            }
                            className="min-h-40 w-full border border-subtle bg-canvas px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder={t('photoPanel.notePlaceholder')}
                          />
                        </div>

                        <div className="space-y-3">
                          <label
                            htmlFor={`edit-photo-date-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            {t('common.labels.date')}
                          </label>
                          <input
                            id={`edit-photo-date-${photo.id}`}
                            type="text"
                            value={editFormState.date}
                            onChange={(event) =>
                              handleEditFieldChange('date', event.target.value)
                            }
                            className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder={t('albumsPanel.form.datePlaceholder')}
                          />
                        </div>

                        <div className="space-y-3">
                          <label
                            htmlFor={`edit-photo-location-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            {t('common.labels.location')}
                          </label>
                          <input
                            id={`edit-photo-location-${photo.id}`}
                            type="text"
                            value={editFormState.location}
                            onChange={(event) =>
                              handleEditFieldChange(
                                'location',
                                event.target.value,
                              )
                            }
                            className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder={t('photoPanel.locationPlaceholder')}
                          />
                        </div>

                        <div className="space-y-3">
                          <label
                            htmlFor={`edit-photo-layout-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            {t('photoPanel.layoutLabel')}
                          </label>
                          <select
                            id={`edit-photo-layout-${photo.id}`}
                            value={editFormState.layout}
                            onChange={(event) =>
                              handleEditFieldChange(
                                'layout',
                                event.target.value,
                              )
                            }
                            className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
                          >
                            <option value="">
                              {t('photoPanel.layoutPlaceholder')}
                            </option>
                            {layoutOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
                        <button
                          type="submit"
                          disabled={savingPhotoId === photo.id}
                          className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                        >
                          {savingPhotoId === photo.id
                            ? t('photoPanel.saving')
                            : t('photoPanel.save')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditPhoto}
                          className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                        >
                          {t('photoPanel.cancel')}
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminPhotoUploadPanel
