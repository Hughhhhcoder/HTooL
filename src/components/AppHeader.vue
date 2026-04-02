<template>
  <header class="site-header">
    <div class="site-header__inner">
      <router-link to="/" class="brand" aria-label="返回首页">
        <span class="brand-mark">HT</span>
        <span class="brand-text">
          <strong>HTooL</strong>
          <small>Editorial Utility Suite</small>
        </span>
      </router-link>

      <nav class="top-nav" aria-label="主导航">
        <router-link to="/" class="nav-link">工具画廊</router-link>
      </nav>

      <button
        class="btn theme-button"
        type="button"
        :aria-label="isDark ? '切换到浅色模式' : '切换到暗色模式'"
        @click="toggleTheme"
      >
        {{ isDark ? '浅色' : '暗色' }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const applyTheme = () => {
  document.documentElement.classList.toggle('dark-theme', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
  } else if (!savedTheme) {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  applyTheme()
})
</script>

<style scoped>
.site-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1200;
  border-bottom: 1px solid var(--border-weak);
  background: color-mix(in srgb, var(--surface-base) 92%, transparent);
  backdrop-filter: blur(8px);
}

.site-header__inner {
  width: min(1120px, 100%);
  margin: 0 auto;
  min-height: 68px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-strong);
  color: var(--accent);
  font-weight: 700;
  letter-spacing: 0.06em;
}

.brand-text {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text strong {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.brand-text small {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-size: 0.86rem;
  transition: border-color var(--duration-fast) var(--easing-standard),
    background-color var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.nav-link:hover,
.nav-link.router-link-active {
  border-color: var(--border-weak);
  color: var(--text-primary);
  background: var(--surface-muted);
}

.theme-button {
  min-width: 82px;
}

@media (max-width: 860px) {
  .site-header__inner {
    min-height: 60px;
    padding: 10px 14px;
  }

  .brand-text small,
  .top-nav {
    display: none;
  }
}
</style>
