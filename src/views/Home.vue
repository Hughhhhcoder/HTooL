<template>
  <div class="home">
    <header class="header">
      <h1>HTooL</h1>
    </header>
    <div class="tools-grid">
      <div class="tool-card" @click="navigateToMarkdown">
        <div class="tool-icon">📝</div>
        <h2>Markdown 编辑器</h2>
        <p>一个功能强大的 Markdown 编辑器，支持实时预览</p>
      </div>
      <!-- 可以在这里添加更多工具卡片 -->
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToMarkdown = () => {
  router.push('/markdown')
}
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  color: #333;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tool-card {
  background: white;
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

.tool-card h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.tool-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}
</style> 