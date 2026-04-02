import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import MarkdownEditor from '../../src/views/MarkdownEditor.vue'

const waitForRender = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('MarkdownEditor view', () => {
  it('should toggle preview mode and render markdown content', async () => {
    vi.stubGlobal('showDirectoryPicker', vi.fn())
    const wrapper = mount(MarkdownEditor)

    const editor = wrapper.find('.editor')
    editor.element.textContent = '# Hello'
    editor.element.dispatchEvent(new Event('input'))
    await waitForRender()

    const previewToggle = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === '预览')

    expect(previewToggle).toBeTruthy()
    await previewToggle.trigger('click')
    await waitForRender()

    expect(wrapper.find('.preview').exists()).toBe(true)
    expect(wrapper.text()).toContain('编辑')
  })

  it('should tolerate invalid markdown input without crashing', async () => {
    vi.stubGlobal('showDirectoryPicker', vi.fn())
    const wrapper = mount(MarkdownEditor)

    const editor = wrapper.find('.editor')
    editor.element.textContent = '[bad link]('
    editor.element.dispatchEvent(new Event('input'))
    await waitForRender()

    const previewToggle = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === '预览')

    await previewToggle.trigger('click')
    await waitForRender()

    expect(wrapper.find('.preview').exists()).toBe(true)
  })
})
