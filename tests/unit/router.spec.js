import { describe, expect, it } from 'vitest'
import router from '../../src/router'

describe('router redirects', () => {
  it('should redirect removed routes to home', async () => {
    await router.push('/math')
    await router.isReady()
    expect(router.currentRoute.value.path).toBe('/')

    await router.push('/pomodoro')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
