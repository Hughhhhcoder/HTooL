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
  --primary-color-dark: #0056b3;
  --text-color: #333;
  --text-primary: #1f2933;
  --text-secondary: #667085;
  --text-color-secondary: #6a737d;
  --bg-color: #fff;
  --bg-color-secondary: #f7f9fc;
  --hover-color: #f3f7ff;
  --code-bg: #f6f8fa;
  --border-color: #dee2e6;
}

.dark-theme {
  --primary-color: #4096ff;
  --primary-color-dark: #1677ff;
  --text-color: #eef1f4;
  --text-primary: #f2f4f7;
  --text-secondary: #98a2b3;
  --text-color-secondary: #98a2b3;
  --bg-color: #1f242b;
  --bg-color-secondary: #2a313b;
  --hover-color: #2f3947;
  --code-bg: #2a313b;
  --border-color: #424c5b;
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
