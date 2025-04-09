<template>
  <div>
    <button @click="toggleTheme">切换主题</button>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const currentTheme = ref('light');

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', currentTheme.value);
};

// 初始化时设置主题
onMounted(() => {
  document.documentElement.setAttribute('data-theme', currentTheme.value);
});
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

button {
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: var(--accent-color);
}

.tool-card {
  background: var(--primary-color);
  color: var(--button-text-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.tool-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .tool-card {
    padding: 15px;
  }

  .tool-icon {
    font-size: 2rem;
  }

  button {
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: 10px;
  }

  .tool-icon {
    font-size: 1.5rem;
  }

  button {
    padding: 6px 12px;
  }
}

:root {
  --background-color: #f0f4f8;
  --text-color: #333;
  --primary-color: #6c7a89;
  --secondary-color: #95a5a6;
  --accent-color: #e74c3c;
  --button-bg-color: #3498db;
  --button-text-color: #fff;
}

[data-theme='dark'] {
  --background-color: #1e1e1e;
  --text-color: #e0e0e0;
  --button-bg-color: #3a3a3a;
  --button-text-color: #ffffff;
  --header-bg-color: #2a2a2a;
  --header-text-color: #ffffff;
  --module-bg-color: #2e2e2e;
  --module-text-color: #e0e0e0;
}
</style> 