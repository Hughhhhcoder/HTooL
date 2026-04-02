import { describe, expect, it } from 'vitest'
import { detectQrContentType, isValidUrl } from '../../src/utils/qr'

describe('qr utils', () => {
  it('should validate URL values', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('not-url')).toBe(false)
  })

  it('should detect qr content type', () => {
    expect(detectQrContentType('https://example.com')).toBe('URL')
    expect(detectQrContentType('mailto:someone@example.com')).toBe('邮箱地址')
    expect(detectQrContentType('12345')).toBe('数字')
    expect(detectQrContentType('plain text')).toBe('文本')
  })
})
