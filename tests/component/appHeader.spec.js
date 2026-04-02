import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from '../../src/components/AppHeader.vue'

const makeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })

describe('AppHeader', () => {
  it('should toggle dark theme class on html element', async () => {
    const storage = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    })
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {}
    }))

    const router = makeRouter()
    await router.push('/')
    await router.isReady()

    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })

    const button = wrapper.get('button')
    const initialState = document.documentElement.classList.contains('dark-theme')
    await button.trigger('click')
    const nextState = document.documentElement.classList.contains('dark-theme')
    expect(nextState).toBe(!initialState)
  })
})
