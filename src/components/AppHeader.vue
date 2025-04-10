<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <router-link to="/">
          <i class="fas fa-tools"></i>
          <span>HTooL</span>
        </router-link>
      </div>
      <div class="header-actions">
        <button class="theme-toggle" @click="toggleTheme">
          <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark-theme')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark-theme')
  }
})
</script>

<style scoped>
.app-header {
  background: var(--bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-color);
  font-size: 20px;
  font-weight: bold;
}

.logo i {
  font-size: 24px;
  color: var(--primary-color);
}

.theme-toggle {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.theme-toggle:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

/* 暗色模式支持 */
.dark-theme .app-header {
  background: #2d2d2d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark-theme .theme-toggle {
  background: #333;
  border-color: #444;
  color: #fff;
}

.dark-theme .theme-toggle:hover {
  background: var(--primary-color);
  color: white;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 15px;
  }

  .logo span {
    font-size: 18px;
  }

  .theme-toggle {
    width: 36px;
    height: 36px;
  }
}
</style> 