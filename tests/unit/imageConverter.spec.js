import { describe, expect, it } from 'vitest'
import {
  buildConvertedFileName,
  normalizeQuality,
  toMimeType
} from '../../src/utils/imageConverter'

describe('image converter utils', () => {
  it('should build converted filename', () => {
    expect(buildConvertedFileName('photo.png', 'jpg')).toBe('photo.jpg')
    expect(buildConvertedFileName('photo', 'webp')).toBe('photo.webp')
  })

  it('should normalize quality to 0.01-1', () => {
    expect(normalizeQuality(80)).toBe(0.8)
    expect(normalizeQuality(200)).toBe(1)
    expect(normalizeQuality(-10)).toBe(0.01)
  })

  it('should map target format to mime type', () => {
    expect(toMimeType('jpg')).toBe('image/jpeg')
    expect(toMimeType('png')).toBe('image/png')
  })
})
