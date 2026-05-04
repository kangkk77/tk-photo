import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { PhotoRow } from '../types/database'
import {
  deletePhoto,
  listPhotosByAlbum,
  uploadPhotoToAlbum,
} from '../services/photoRepository'

interface AdminPhotoUploadPanelProps {
  albumId: string
  albumTitle: string
}

interface PhotoFormState {
  title: string
  description: string
}

const initialPhotoFormState: PhotoFormState = {
  title: '',
  description: '',
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

function renderValue(value: string | number | null) {
  if (value === null || value === '') {
    return '--'
  }

  return value
}

function AdminPhotoUploadPanel({
  albumId,
  albumTitle,
}: AdminPhotoUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [photos, setPhotos] = useState<PhotoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formState, setFormState] = useState<PhotoFormState>(
    initialPhotoFormState,
  )
  const [isUploading, setIsUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)

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

        setErrorMessage(getErrorMessage(error, 'Unable to load album photos.'))
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
  }, [albumId])

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage('Choose an image file before uploading.')
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage(null)

      const uploadedPhoto = await uploadPhotoToAlbum(albumId, selectedFile, {
        title: formState.title,
        description: formState.description,
      })

      setPhotos((currentPhotos) => [uploadedPhoto, ...currentPhotos])
      setFormState(initialPhotoFormState)
      setSelectedFile(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to upload photo.'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePhoto = async (photo: PhotoRow) => {
    const confirmed = window.confirm(
      `Delete photo "${photo.title ?? photo.image_path}" from "${albumTitle}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingPhotoId(photo.id)
      setErrorMessage(null)
      await deletePhoto(photo.id)
      setPhotos((currentPhotos) =>
        currentPhotos.filter((entry) => entry.id !== photo.id),
      )
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Unable to delete photo.'))
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <section className="space-y-6 border-t border-subtle pt-5">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">
          Photo Management
        </p>
        <p className="text-sm leading-8 text-soft md:text-base">
          Upload one original image at a time for this album. EXIF will be read
          in the browser when available, then stored with the photo record.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleUpload}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 md:col-span-2">
            <label
              htmlFor={`photo-file-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              Image File
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
                ? `Selected file: ${selectedFile.name}`
                : 'No file selected yet.'}
            </p>
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`photo-title-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              Title
            </label>
            <input
              id={`photo-title-${albumId}`}
              type="text"
              value={formState.title}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  title: event.target.value,
                }))
              }
              className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
              placeholder="Optional photo title"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`photo-description-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              Description
            </label>
            <input
              id={`photo-description-${albumId}`}
              type="text"
              value={formState.description}
              onChange={(event) =>
                setFormState((currentState) => ({
                  ...currentState,
                  description: event.target.value,
                }))
              }
              className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
              placeholder="Optional photo note"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="space-y-2 border-t border-subtle pt-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              Photo Panel Error
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : null}

        <div className="border-t border-subtle pt-6">
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      <div className="space-y-4 border-t border-subtle pt-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            Uploaded Photos
          </p>
          <p className="text-sm leading-8 text-soft md:text-base">
            Storage paths and extracted EXIF stay visible here for quick
            verification.
          </p>
        </div>

        {loading ? (
          <p className="text-sm leading-8 text-soft md:text-base">
            Loading album photos...
          </p>
        ) : errorMessage && photos.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              Unable to load photos.
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              No photos yet.
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              Upload the first frame for this sequence from the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {photos.map((photo) => (
              <article
                key={photo.id}
                className="space-y-4 border-t border-subtle pt-5 first:border-t-0 first:pt-0"
              >
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl leading-tight text-ink">
                    {photo.title ?? 'Untitled photo'}
                  </h3>
                  <p className="break-all text-sm leading-7 text-soft">
                    {photo.image_path}
                  </p>
                </div>

                <dl className="grid gap-3 text-sm leading-7 text-soft md:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Camera
                    </dt>
                    <dd>{renderValue(photo.camera)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Lens
                    </dt>
                    <dd>{renderValue(photo.lens)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Aperture
                    </dt>
                    <dd>{renderValue(photo.aperture)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Shutter Speed
                    </dt>
                    <dd>{renderValue(photo.shutter_speed)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      ISO
                    </dt>
                    <dd>{renderValue(photo.iso)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">
                      Focal Length
                    </dt>
                    <dd>{renderValue(photo.focal_length)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  disabled={deletingPhotoId === photo.id}
                  onClick={() => void handleDeletePhoto(photo)}
                  className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                >
                  {deletingPhotoId === photo.id ? 'Deleting...' : 'Delete Photo'}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminPhotoUploadPanel
