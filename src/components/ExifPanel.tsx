import type { Photo } from '../types'
import { useI18n } from '../hooks/useI18n'

type ExifPanelProps = {
  photo: Photo
}

type ExifRow = {
  label: string
  value: string | number
}

function ExifPanel({ photo }: ExifPanelProps) {
  const { t } = useI18n()
  const rows: ExifRow[] = [
    { label: t('exif.camera'), value: photo.camera },
    { label: t('exif.lens'), value: photo.lens },
    { label: t('exif.aperture'), value: photo.aperture },
    { label: t('exif.shutter'), value: photo.shutterSpeed },
    { label: t('exif.iso'), value: photo.iso },
    { label: t('exif.focalLength'), value: photo.focalLength },
    { label: t('exif.date'), value: photo.date },
    { label: t('exif.location'), value: photo.location },
  ].filter((row) => String(row.value).trim().length > 0)

  return (
    <section className="space-y-5 border-t border-subtle pt-6">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">
        {t('exif.overline')}
      </p>

      <div className="divide-y divide-subtle/80">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-4 py-3 md:grid-cols-[7rem_minmax(0,1fr)]"
          >
            <span className="text-[11px] uppercase tracking-[0.28em] text-muted">
              {row.label}
            </span>
            <span className="font-mono text-sm text-ink">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ExifPanel
