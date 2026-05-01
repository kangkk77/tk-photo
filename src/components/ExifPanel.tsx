import type { Photo } from '../types'

type ExifPanelProps = {
  photo: Photo
}

type ExifRow = {
  label: string
  value: string | number
}

function ExifPanel({ photo }: ExifPanelProps) {
  const rows: ExifRow[] = [
    { label: 'CAMERA', value: photo.camera },
    { label: 'LENS', value: photo.lens },
    { label: 'APERTURE', value: photo.aperture },
    { label: 'SHUTTER', value: photo.shutterSpeed },
    { label: 'ISO', value: photo.iso },
    { label: 'FOCAL', value: photo.focalLength },
  ]

  return (
    <section className="space-y-5 border-t border-subtle pt-6">
      <p className="text-xs uppercase tracking-[0.3em] text-muted">
        Capture Data
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
