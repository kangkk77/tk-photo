import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import exifr from 'exifr'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const imageDirectory = path.join(projectRoot, 'public', 'images', 'golden-coast')
const reportPath = path.join(projectRoot, 'EXIF_REPORT.md')
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png'])

function formatAperture(value) {
  if (!value) {
    return ''
  }

  return `f/${Number(value).toFixed(1).replace(/\.0$/, '')}`
}

function formatShutterSpeed(exif) {
  if (typeof exif.ExposureTime === 'number' && exif.ExposureTime > 0) {
    if (exif.ExposureTime >= 1) {
      return `${Number(exif.ExposureTime).toFixed(1).replace(/\.0$/, '')}s`
    }

    const reciprocal = Math.round(1 / exif.ExposureTime)
    return `1/${reciprocal}s`
  }

  if (typeof exif.ShutterSpeedValue === 'number') {
    const seconds = 2 ** -exif.ShutterSpeedValue

    if (seconds >= 1) {
      return `${Number(seconds).toFixed(1).replace(/\.0$/, '')}s`
    }

    const reciprocal = Math.round(1 / seconds)
    return `1/${reciprocal}s`
  }

  return ''
}

function formatFocalLength(value) {
  if (!value) {
    return ''
  }

  return `${Number(value).toFixed(0)}mm`
}

function formatDate(value) {
  if (!value) {
    return ''
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 19).replace('T', ' ')
}

function formatLocation(exif) {
  if (typeof exif.latitude === 'number' && typeof exif.longitude === 'number') {
    return `${exif.latitude.toFixed(6)}, ${exif.longitude.toFixed(6)}`
  }

  return ''
}

function getValueLines(data) {
  return [
    ['camera', data.camera],
    ['lens', data.lens],
    ['aperture', data.aperture],
    ['shutterSpeed', data.shutterSpeed],
    ['iso', data.iso],
    ['focalLength', data.focalLength],
    ['date', data.date],
    ['location', data.location],
  ]
}

function toMarkdownSection(fileName, extractedData, hasExif) {
  const lines = [`## ${fileName}`, '']

  if (!hasExif) {
    lines.push('未检测到 EXIF，可能是图片被压缩或导出时清除了元数据。', '')
    return lines.join('\n')
  }

  for (const [label, value] of getValueLines(extractedData)) {
    lines.push(`- ${label}: ${value || ''}`)
  }

  lines.push('')
  return lines.join('\n')
}

async function extractExifForFile(filePath) {
  const exif = await exifr.parse(filePath, {
    tiff: true,
    exif: true,
    gps: true,
    xmp: true,
    icc: false,
    iptc: false,
  })

  if (!exif) {
    return {
      hasExif: false,
      data: null,
    }
  }

  return {
    hasExif: true,
    data: {
      camera: exif.Model || '',
      lens: exif.LensModel || '',
      aperture: formatAperture(exif.FNumber),
      shutterSpeed: formatShutterSpeed(exif),
      iso: exif.ISO || '',
      focalLength: formatFocalLength(exif.FocalLength),
      date: formatDate(
        exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate,
      ),
      location: formatLocation(exif),
    },
  }
}

async function main() {
  const directoryEntries = await fs.readdir(imageDirectory, {
    withFileTypes: true,
  })
  const imageFiles = directoryEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) =>
      supportedExtensions.has(path.extname(fileName).toLowerCase()),
    )
    .sort((left, right) => left.localeCompare(right))

  const sections = [
    '# EXIF Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    'Image directory: `public/images/golden-coast/`',
    '',
  ]

  for (const fileName of imageFiles) {
    const filePath = path.join(imageDirectory, fileName)
    const result = await extractExifForFile(filePath)

    sections.push(toMarkdownSection(fileName, result.data, result.hasExif))
  }

  await fs.writeFile(reportPath, `${sections.join('\n')}\n`, 'utf8')
  console.log(`EXIF report written to ${reportPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
