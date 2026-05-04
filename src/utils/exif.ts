import exifr from 'exifr'

export interface ParsedImageExif {
  camera: string | null
  lens: string | null
  aperture: string | null
  shutterSpeed: string | null
  iso: number | null
  focalLength: string | null
  date: string | null
  location: string | null
}

interface RawExifData {
  Make?: string
  Model?: string
  LensModel?: string
  FNumber?: number
  ExposureTime?: number
  ISO?: number
  PhotographicSensitivity?: number
  FocalLength?: number
  DateTimeOriginal?: Date | string
  CreateDate?: Date | string
  latitude?: number
  longitude?: number
}

const emptyExif: ParsedImageExif = {
  camera: null,
  lens: null,
  aperture: null,
  shutterSpeed: null,
  iso: null,
  focalLength: null,
  date: null,
  location: null,
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function formatCamera(make?: string, model?: string): string | null {
  const normalizedMake = normalizeText(make)
  const normalizedModel = normalizeText(model)

  if (!normalizedMake && !normalizedModel) {
    return null
  }

  if (!normalizedMake) {
    return normalizedModel
  }

  if (!normalizedModel) {
    return normalizedMake
  }

  if (normalizedModel.toLowerCase().startsWith(normalizedMake.toLowerCase())) {
    return normalizedModel
  }

  return `${normalizedMake} ${normalizedModel}`
}

function formatAperture(value?: number): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  return `f/${formatNumber(value)}`
}

function formatShutterSpeed(value?: number): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  if (value >= 1) {
    return `${formatNumber(value)}s`
  }

  const denominator = Math.round(1 / value)
  return denominator > 0 ? `1/${denominator}s` : `${value}s`
}

function formatFocalLength(value?: number): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null
  }

  return `${formatNumber(value)}mm`
}

function padDateSegment(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatExifDate(value?: Date | string): string | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return [
      value.getFullYear(),
      padDateSegment(value.getMonth() + 1),
      padDateSegment(value.getDate()),
    ].join('-') +
      ' ' +
      [
        padDateSegment(value.getHours()),
        padDateSegment(value.getMinutes()),
        padDateSegment(value.getSeconds()),
      ].join(':')
  }

  const normalizedValue = normalizeText(value)
  return normalizedValue
}

function formatLocation(latitude?: number, longitude?: number): string | null {
  if (
    typeof latitude !== 'number' ||
    !Number.isFinite(latitude) ||
    typeof longitude !== 'number' ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
}

export async function parseImageExif(file: File): Promise<ParsedImageExif> {
  try {
    const rawExif = (await exifr.parse(file, {
      tiff: true,
      exif: true,
      gps: true,
    })) as RawExifData | null

    if (!rawExif) {
      return emptyExif
    }

    return {
      camera: formatCamera(rawExif.Make, rawExif.Model),
      lens: normalizeText(rawExif.LensModel),
      aperture: formatAperture(rawExif.FNumber),
      shutterSpeed: formatShutterSpeed(rawExif.ExposureTime),
      iso:
        typeof rawExif.ISO === 'number'
          ? rawExif.ISO
          : typeof rawExif.PhotographicSensitivity === 'number'
            ? rawExif.PhotographicSensitivity
            : null,
      focalLength: formatFocalLength(rawExif.FocalLength),
      date: formatExifDate(rawExif.DateTimeOriginal ?? rawExif.CreateDate),
      location: formatLocation(rawExif.latitude, rawExif.longitude),
    }
  } catch (error) {
    console.warn('parseImageExif failed', error)
    return emptyExif
  }
}
