import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { AlbumTheme } from '../types'
import type { AlbumRow, DatabaseAlbumVisibility } from '../types/database'
import {
  createAlbum,
  deleteAlbum,
  listMyAlbums,
  updateAlbum,
} from '../services/albumRepository'
import AdminPhotoUploadPanel from './AdminPhotoUploadPanel'

const themeOptions: { value: AlbumTheme; label: string }[] = [
  { value: 'seascape', label: '海景' },
  { value: 'sunset', label: '夕照' },
  { value: 'city', label: '城市' },
  { value: 'portrait', label: '人像' },
  { value: 'travel', label: '旅行' },
  { value: 'daily', label: '日常' },
  { value: 'other', label: '其他' },
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

function AlbumFormFields({
  formState,
  idPrefix,
  onFieldChange,
}: AlbumFormFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor={`${idPrefix}-title`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          相册标题
        </label>
        <input
          id={`${idPrefix}-title`}
          type="text"
          value={formState.title}
          onChange={(event) => onFieldChange('title', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder="请输入相册标题"
          required
        />
      </div>

      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor={`${idPrefix}-subtitle`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          副标题
        </label>
        <input
          id={`${idPrefix}-subtitle`}
          type="text"
          value={formState.subtitle}
          onChange={(event) => onFieldChange('subtitle', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder="可选副标题"
        />
      </div>

      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor={`${idPrefix}-description`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          相册说明
        </label>
        <textarea
          id={`${idPrefix}-description`}
          value={formState.description}
          onChange={(event) => onFieldChange('description', event.target.value)}
          className="min-h-32 w-full border border-subtle bg-canvas px-4 py-3 text-sm leading-8 text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder="为这组作品写一段简短说明"
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-theme`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          主题
        </label>
        <select
          id={`${idPrefix}-theme`}
          value={formState.theme}
          onChange={(event) => onFieldChange('theme', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
        >
          <option value="">暂不设置</option>
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
          可见性
        </label>
        <select
          id={`${idPrefix}-visibility`}
          value={formState.visibility}
          onChange={(event) => onFieldChange('visibility', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-soft"
        >
          <option value="public">公开</option>
          <option value="private">私密</option>
        </select>
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-date`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          日期
        </label>
        <input
          id={`${idPrefix}-date`}
          type="text"
          value={formState.date}
          onChange={(event) => onFieldChange('date', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder="例如 2026-05-04"
        />
      </div>

      <div className="space-y-3">
        <label
          htmlFor={`${idPrefix}-location`}
          className="text-xs uppercase tracking-[0.28em] text-muted"
        >
          地点
        </label>
        <input
          id={`${idPrefix}-location`}
          type="text"
          value={formState.location}
          onChange={(event) => onFieldChange('location', event.target.value)}
          className="w-full border border-subtle bg-canvas px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-soft"
          placeholder="例如 厦门 / 香港 / 家附近"
        />
      </div>
    </div>
  )
}

function AdminAlbumsPanel() {
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

        setErrorMessage(getErrorMessage(error, '无法加载你的相册列表。'))
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
      setSuccessMessage(`已创建相册《${createdAlbum.title}》。`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '创建相册失败。'))
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
      setSuccessMessage(`已更新相册《${updatedAlbum.title}》。`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '更新相册失败。'))
    } finally {
      setSavingAlbumId(null)
    }
  }

  const handleDeleteAlbum = async (album: AlbumRow) => {
    const confirmed = window.confirm(
      `确定要删除相册《${album.title}》吗？这个操作无法撤销。`,
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
      setSuccessMessage(`已删除相册《${album.title}》。`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '删除相册失败。'))
    } finally {
      setDeletingAlbumId(null)
    }
  }

  return (
    <div className="grid gap-10 border-t border-subtle pt-8 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] md:gap-x-14 md:pt-10">
      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            新建相册
          </p>
          <p className="max-w-2xl text-sm leading-8 text-soft md:text-base">
            在不影响公开展览页的前提下，先把作品集的结构、说明和可见性整理好。
            封面图片可以在下方照片管理区域里直接指定。
          </p>
        </div>

        {(errorMessage || successMessage) && (
          <div className="space-y-2 border-t border-subtle pt-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">
              状态
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
          <AlbumFormFields
            formState={formState}
            idPrefix="create-album"
            onFieldChange={handleCreateFieldChange}
          />

          <div className="border-t border-subtle pt-6">
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex min-w-36 items-center justify-center border border-subtle px-5 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
            >
              {isCreating ? '创建中...' : '创建相册'}
            </button>
          </div>
        </form>
      </section>

      <aside className="space-y-6 border-t border-subtle/80 pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-1">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-muted">
            我的相册
          </p>
          <p className="text-sm leading-8 text-soft md:text-base">
            当前账号创建的相册都在这里，可以继续编辑、整理照片、指定封面。
          </p>
        </div>

        {loading ? (
          <p className="text-sm leading-8 text-soft md:text-base">
            正在加载你的相册...
          </p>
        ) : errorMessage && albums.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              相册暂时无法加载
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              {errorMessage}
            </p>
          </div>
        ) : albums.length === 0 ? (
          <div className="space-y-3">
            <p className="font-serif text-2xl leading-tight text-ink">
              还没有相册
            </p>
            <p className="text-sm leading-8 text-soft md:text-base">
              先从左侧创建第一本作品集，再继续上传照片和设置封面。
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
                    {(album.subtitle ?? '暂无副标题') + ' / ' + (album.visibility === 'public' ? '公开' : '私密')}
                  </p>
                </div>

                <div className="space-y-2 text-sm leading-7 text-soft">
                  <p>{album.description ?? '暂时还没有相册说明。'}</p>
                  <p>日期：{album.date ?? '未填写'}</p>
                  <p>地点：{album.location ?? '未填写'}</p>
                  <p>
                    封面：
                    {album.cover_image
                      ? album.cover_image
                      : '尚未设置，可从下方照片中选择一张设为封面。'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleStartEditAlbum(album)}
                    className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                  >
                    编辑相册
                  </button>
                  <button
                    type="button"
                    disabled={deletingAlbumId === album.id}
                    onClick={() => void handleDeleteAlbum(album)}
                    className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-2 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                  >
                    {deletingAlbumId === album.id ? '删除中...' : '删除相册'}
                  </button>
                </div>

                {editingAlbumId === album.id ? (
                  <form
                    className="space-y-6 border-t border-subtle pt-5"
                    onSubmit={(event) => void handleSaveAlbum(event, album)}
                  >
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.28em] text-muted">
                        编辑相册
                      </p>
                      <p className="text-sm leading-8 text-soft md:text-base">
                        调整相册标题、说明、时间与可见性。取消后会恢复到当前保存状态。
                      </p>
                    </div>

                    <AlbumFormFields
                      formState={editFormState}
                      idPrefix={`edit-album-${album.id}`}
                      onFieldChange={handleEditFieldChange}
                    />

                    <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
                      <button
                        type="submit"
                        disabled={savingAlbumId === album.id}
                        className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent disabled:cursor-not-allowed disabled:text-muted"
                      >
                        {savingAlbumId === album.id ? '保存中...' : '保存修改'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditAlbum}
                        className="inline-flex min-w-28 items-center justify-center border border-subtle px-4 py-3 text-sm tracking-[0.08em] text-ink transition-colors hover:border-soft hover:text-accent"
                      >
                        取消
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
            ))}
          </div>
        )}
      </aside>
    </div>
  )
}

export default AdminAlbumsPanel
