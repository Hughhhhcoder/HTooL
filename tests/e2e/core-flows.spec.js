import { expect, test } from '@playwright/test'

test('home to markdown editor navigation works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: 'Markdown 编辑器' }).first().click()
  await expect(page).toHaveURL(/\/markdown$/)
  await expect(page.getByRole('heading', { name: 'Markdown 编辑器' })).toBeVisible()
})

test('removed routes should redirect to home', async ({ page }) => {
  await page.goto('/math')
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/pomodoro')
  await expect(page).toHaveURL(/\/$/)
})

test('markdown editor preview flow works', async ({ page }) => {
  await page.goto('/markdown')

  await page.evaluate(() => {
    const editor = document.querySelector('.editor')
    if (!editor) throw new Error('editor not found')
    editor.textContent = '# Title from e2e'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
  })

  await page.getByRole('button', { name: '预览', exact: true }).click()
  await expect(page.locator('.preview')).toContainText('Title from e2e')
})

test('qr code generation flow works', async ({ page }) => {
  await page.goto('/qrcode')
  await page.locator('textarea').fill('https://example.com')
  await page.getByRole('button', { name: '生成二维码' }).click()
  await expect(page.locator('.qr-result img')).toBeVisible()
})

test('markdown html preview removes executable HTML', async ({ page }) => {
  await page.goto('/markdown-html')
  await page.locator('textarea').first().fill('<img src=x onerror=alert(1)>')
  await expect(page.locator('.html-preview')).toBeVisible()
  await expect(page.locator('.html-preview')).not.toContainText('onerror')
  await expect(page.locator('.html-preview img')).not.toHaveAttribute('onerror')
})

test('home supports light and dark visual captures', async ({ page }) => {
  await page.goto('/')
  const lightImage = await page.screenshot({ fullPage: true })
  expect(lightImage.byteLength).toBeGreaterThan(1000)

  await page.getByRole('button', { name: '切换到暗色模式' }).click()
  const darkImage = await page.screenshot({ fullPage: true })
  expect(darkImage.byteLength).toBeGreaterThan(1000)
})
