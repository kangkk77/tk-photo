export function getImagePath(relativePath: string): string {
  if (!relativePath) {
    return ''
  }

  if (/^(?:https?:)?\/\//i.test(relativePath) || /^(?:data|blob):/i.test(relativePath)) {
    return relativePath
  }

  const normalizedBase = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  const normalizedPath = relativePath.replace(/^\/+/, '')

  return `${normalizedBase}images/${normalizedPath}`
}
