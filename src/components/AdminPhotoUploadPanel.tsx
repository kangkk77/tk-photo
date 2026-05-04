import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { PhotoLayout } from '../types'
import type { AlbumRow, PhotoRow } from '../types/database'
import { setAlbumCover } from '../services/albumRepository'
import {
  deletePhoto,
  listPhotosByAlbum,
  updatePhoto,
  uploadPhotoToAlbum,
} from '../services/photoRepository'

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

const layoutOptions: { value: PhotoLayout; label: string }[] = [
  { value: 'full', label: '完整幅面' },
  { value: 'half', label: '半宽' },
  { value: 'large', label: '强调大图' },
]

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

function formatExifSummary(photo: PhotoRow) {
  const parts = [
    photo.camera,
    photo.lens,
    photo.aperture,
    photo.shutter_speed,
    photo.iso ? `ISO ${photo.iso}` : null,
    photo.focal_length,
  ].filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(' / ') : '暂无 EXIF 摘要。'
}

function AdminPhotoUploadPanel({
  albumId,
  albumTitle,
  coverImage,
  onAlbumUpdated,
}: AdminPhotoUploadPanelProps) {
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

        setErrorMessage(getErrorMessage(error, '无法加载相册中的照片。'))
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

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setErrorMessage('请先选择一张图片再上传。')
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
      setSuccessMessage(`已上传照片《${uploadedPhoto.title ?? '未命名照片'}》。`)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '上传照片失败。'))
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
      setSuccessMessage(`已更新照片《${updatedPhoto.title ?? '未命名照片'}》。`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '更新照片信息失败。'))
    } finally {
      setSavingPhotoId(null)
    }
  }

  const handleSetCover = async (photo: PhotoRow) => {
    if (photo.image_path === coverImage) {
      setSuccessMessage('这张照片已经是当前封面。')
      return
    }

    try {
      setCoverPhotoId(photo.id)
      setErrorMessage(null)
      setSuccessMessage(null)

      const updatedAlbum = await setAlbumCover(albumId, photo.image_path)
      onAlbumUpdated?.(updatedAlbum)
      setSuccessMessage(`已将《${photo.title ?? '未命名照片'}》设为相册封面。`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '设置相册封面失败。'))
    } finally {
      setCoverPhotoId(null)
    }
  }

  const handleDeletePhoto = async (photo: PhotoRow) => {
    const confirmed = window.confirm(
      `确定要从《${albumTitle}》中删除照片《${photo.title ?? photo.image_path}》吗？`,
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
            `照片已删除，但清空相册封面失败：${getErrorMessage(
              error,
              '请稍后重试。',
            )}`,
          )
        }
      }

      setPhotos((currentPhotos) =>
        currentPhotos.filter((entry) => entry.id !== photo.id),
      )
      setSuccessMessage(`已删除照片《${photo.title ?? '未命名照片'}》。`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '删除照片失败。'))
    } finally {
      setDeletingPhotoId(null)
    }
  }

  return (
    <section className="space-y-6 border-t border-subtle pt-5">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-muted">
          照片管理
        </p>
        <p className="text-sm leading-8 text-soft md:text-base">
          这里负责上传原图、整理照片说明、填写随笔和指定相册封面。公开展示页暂时不会读取这里的内容。
        </p>
        <p className="text-sm leading-8 text-soft md:text-base">
          {coverImage
            ? `当前封面路径：${coverImage}`
            : '当前还没有封面，可从下方任意一张照片中选择“设为封面”。'}
        </p>
      </div>

      {(errorMessage || successMessage) && (
        <div className="space-y-2 border-t border-subtle pt-5">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            状态
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
              选择图片
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
                ? `已选择文件：${selectedFile.name}`
                : '还没有选择文件。'}
            </p>
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`photo-title-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              照片标题
            </label>
            <input
              id={`photo-title-${albumId}`}
              type="text"
              value={uploadFormState.title}
              onChange={(event) =>
                handleUploadFieldChange('title', event.target.value)
              }
              className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
              placeholder="可选标题"
            />
          </div>

          <div className="space-y-3">
            <label
              htmlFor={`photo-description-${albumId}`}
              className="text-xs uppercase tracking-[0.28em] text-muted"
            >
              简短说明
            </label>
            <input
              id={`photo-description-${albumId}`}
              type="text"
              value={uploadFormState.description}
              onChange={(event) =>
                handleUploadFieldChange('description', event.target.value)
              }
              className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
              placeholder="一句简单描述即可"
            />
          </div>
        </div>

        <div className="border-t border-subtle pt-6">
          <button
            type="submit"
            disabled={isUploading}
            className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
          >
            {isUploading ? '上传中...' : '上传照片'}
          </button>
        </div>
      </form>

      <div className="space-y-4 border-t border-subtle pt-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            已上传照片
          </p>
          <p className="text-sm leading-8 text-soft md:text-base">
            可以继续补写照片说明、随笔、小记、拍摄故事，也可以直接指定相册封面。
          </p>
        </div>

        {loading ? (
          <p className="text-sm leading-8 text-soft md:text-base">
            正在加载照片列表...
          </p>
        ) : errorMessage && photos.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              照片暂时无法加载
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              还没有照片
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              先上传第一张照片，再继续补写故事和设置封面。
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
                        {photo.title ?? '未命名照片'}
                      </h3>
                      {isCurrentCover ? (
                        <span className="text-xs uppercase tracking-[0.2em] text-muted">
                          当前封面
                        </span>
                      ) : null}
                    </div>
                    <p className="break-all text-sm leading-7 text-soft">
                      {photo.image_path}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm leading-7 text-soft">
                    <p>说明：{summarizeText(photo.description, '暂时还没有说明。')}</p>
                    <p>随笔：{summarizeText(photo.note, '暂时还没有随笔或拍摄故事。')}</p>
                    <p>EXIF：{formatExifSummary(photo)}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleStartEditPhoto(photo)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                    >
                      编辑信息
                    </button>
                    <button
                      type="button"
                      disabled={coverPhotoId === photo.id}
                      onClick={() => void handleSetCover(photo)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                    >
                      {coverPhotoId === photo.id ? '设置中...' : '设为封面'}
                    </button>
                    <button
                      type="button"
                      disabled={deletingPhotoId === photo.id}
                      onClick={() => void handleDeletePhoto(photo)}
                      className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                    >
                      {deletingPhotoId === photo.id ? '删除中...' : '删除照片'}
                    </button>
                  </div>

                  {editingPhotoId === photo.id ? (
                    <form
                      className="space-y-6 border-t border-subtle pt-5"
                      onSubmit={(event) => void handleSavePhoto(event, photo)}
                    >
                      <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted">
                          编辑照片
                        </p>
                        <p className="text-sm leading-8 text-soft md:text-base">
                          这里可以补充说明、随笔、小记和拍摄故事，不会改动已写入的 EXIF 参数。
                        </p>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3 md:col-span-2">
                          <label
                            htmlFor={`edit-photo-title-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            照片标题
                          </label>
                          <input
                            id={`edit-photo-title-${photo.id}`}
                            type="text"
                            value={editFormState.title}
                            onChange={(event) =>
                              handleEditFieldChange('title', event.target.value)
                            }
                            className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder="请输入照片标题"
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <label
                            htmlFor={`edit-photo-description-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            照片说明
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
                            placeholder="补充一段简短说明"
                          />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                          <label
                            htmlFor={`edit-photo-note-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            随笔 / 小记 / 拍摄故事
                          </label>
                          <textarea
                            id={`edit-photo-note-${photo.id}`}
                            value={editFormState.note}
                            onChange={(event) =>
                              handleEditFieldChange('note', event.target.value)
                            }
                            className="min-h-40 w-full border border-subtle bg-canvas px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder="写下这张照片背后的情绪、现场、片刻或故事"
                          />
                        </div>

                        <div className="space-y-3">
                          <label
                            htmlFor={`edit-photo-date-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            日期
                          </label>
                          <input
                            id={`edit-photo-date-${photo.id}`}
                            type="text"
                            value={editFormState.date}
                            onChange={(event) =>
                              handleEditFieldChange('date', event.target.value)
                            }
                            className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
                            placeholder="例如 2026-05-04"
                          />
                        </div>

                        <div className="space-y-3">
                          <label
                            htmlFor={`edit-photo-location-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            地点
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
                            placeholder="例如 鼓浪屿 / 东京 / 楼下转角"
                          />
                        </div>

                        <div className="space-y-3">
                          <label
                            htmlFor={`edit-photo-layout-${photo.id}`}
                            className="text-xs uppercase tracking-[0.28em] text-muted"
                          >
                            展示布局
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
                            <option value="">暂不设置</option>
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
                          {savingPhotoId === photo.id ? '保存中...' : '保存修改'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditPhoto}
                          className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                        >
                          取消
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
