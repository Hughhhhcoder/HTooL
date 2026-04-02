const EXTENSION_MAP = {
  jpg: 'jpeg'
}

export const toMimeSubType = (format) => {
  return EXTENSION_MAP[format] || format
}

export const toMimeType = (format) => {
  return `image/${toMimeSubType(format)}`
}

export const buildConvertedFileName = (fileName, targetFormat) => {
  const baseName = fileName.includes('.')
    ? fileName.split('.').slice(0, -1).join('.')
    : fileName
  return `${baseName}.${targetFormat}`
}

export const normalizeQuality = (quality) => {
  const normalized = Number(quality)
  if (!Number.isFinite(normalized)) return 0.8
  return Math.min(1, Math.max(0.01, normalized / 100))
}
