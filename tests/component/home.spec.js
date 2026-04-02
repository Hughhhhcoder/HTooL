import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Home from '../../src/views/Home.vue'

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock
  })
}))

describe('Home view', () => {
  it('should navigate to markdown editor when first card is clicked', async () => {
    pushMock.mockReset()
    const wrapper = mount(Home)
    const cards = wrapper.findAll('.tool-card')
    await cards[0].trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/markdown')
  })
})
