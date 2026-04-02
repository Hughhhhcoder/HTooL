import { expect, test } from '@playwright/test'

test('home to markdown editor navigation works', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('heading', { name: 'Markdown 编辑器' }).first().click()
  await expect(page).toHaveURL(/\/markdown$/)
  await expect(page.getByRole('heading', { name: 'Markdown 编辑器' })).toBeVisible()
})

test('markdown editor preview flow works', async ({ page }) => {
  await page.goto('/markdown')

  const overlay = page.locator('.overlay.show')
  if (await overlay.count()) {
    await overlay.click({ force: true })
  }

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

test('math formula rendering flow works', async ({ page }) => {
  await page.goto('/math')
  await page.locator('textarea').first().fill('c^2 = a^2 + b^2')
  await expect(page.locator('.formula .katex')).toBeVisible()
})
