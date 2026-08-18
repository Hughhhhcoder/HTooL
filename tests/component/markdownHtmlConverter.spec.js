import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MarkdownHtmlConverter from '../../src/views/MarkdownHtmlConverter.vue'

const waitForRender = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('MarkdownHtmlConverter view', () => {
  it('sanitizes executable HTML in the Markdown preview', async () => {
    const wrapper = mount(MarkdownHtmlConverter)

    await wrapper.find('textarea').setValue('<img src=x onerror=alert(1)>')
    await waitForRender()

    expect(wrapper.find('.html-preview').html()).not.toContain('onerror')
  })
})
