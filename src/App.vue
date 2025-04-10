<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<style>
:root {
  --primary-color: #007bff;
  --text-color: #333;
  --bg-color: #fff;
  --border-color: #dee2e6;
}

.dark-theme {
  --primary-color: #007bff;
  --text-color: #fff;
  --bg-color: #2d2d2d;
  --border-color: #444;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: var(--text-color);
  background: var(--bg-color);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  margin-top: 60px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .main-content {
    padding: 15px;
    margin-top: 60px;
  }
}
</style> 