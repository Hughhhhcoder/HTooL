export const isValidUrl = (value) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const detectQrContentType = (content) => {
  if (content.startsWith('tel:')) return '电话号码'
  if (content.startsWith('mailto:')) return '邮箱地址'
  if (isValidUrl(content)) return 'URL'
  if (/^[0-9]+$/.test(content)) return '数字'
  return '文本'
}
