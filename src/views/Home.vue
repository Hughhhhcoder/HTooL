<template>
  <div class="home">
    <header class="header">
      <h1>HTooL</h1>
    </header>
    <div class="tools-grid">
      <div class="tool-card" @click="navigateToMarkdown">
        <div class="tool-icon">📝</div>
        <h2>Markdown 编辑器</h2>
        <p>支持实时预览、代码高亮、文件管理</p>
      </div>
      <div class="tool-card" @click="navigateToImageConverter">
        <div class="tool-icon">🖼️</div>
        <h2>图片转换</h2>
        <p>支持多种图片格式转换，支持调整大小和质量</p>
      </div>
      <div class="tool-card" @click="navigateToQRCodeTool">
        <div class="tool-icon">🔍</div>
        <h2>二维码生成 / 解析</h2>
        <p>支持二维码的生成和解析，包括图片、链接等多种格式</p>
      </div>
      <div class="tool-card" @click="navigateToMarkdownHtmlConverter">
        <div class="tool-icon">🔄</div>
        <h2>Markdown ↔ HTML 互转(待完善)</h2>
        <p>支持 Markdown 和 HTML 之间的相互转换</p>
      </div>
      <div class="tool-card" @click="navigateToDrawingBoard">
        <div class="tool-icon">🖌️</div>
        <h2>手绘板</h2>
        <p>支持绘图和保存功能</p>
      </div>
      <div class="tool-card" @click="navigateToPomodoroTimer">
        <div class="tool-icon">⏲️</div>
        <h2>番茄钟</h2>
        <p>支持倒计时功能</p>
      </div>
      <div class="tool-card" @click="navigateToDataProcessor">
        <div class="tool-icon">🔧</div>
        <h2>数据处理工具</h2>
        <p>支持正则表达式测试、URL编码/解码、Base64编码/解码、哈希计算</p>
      </div>
      <div class="tool-card" @click="navigateToMathTool">
        <div class="tool-icon">🔢</div>
        <h2>数学小工具</h2>
        <p>支持单位换算、数学公式渲染、统计计算、矩阵计算</p>
      </div>
      <div class="tool-card" @click="navigateToIPLocation">
        <div class="tool-icon">📍</div>
        <h2>IP地址定位</h2>
        <p>查询IP地址的地理位置信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const toggleTheme = () => {
  console.log('Theme toggled')
}

const navigateToMarkdown = () => {
  router.push('/markdown')
}

const navigateToImageConverter = () => {
  router.push('/image-converter')
}

const navigateToJsonTableConverter = () => {
  router.push('/json-table-converter')
}

const navigateToQRCodeTool = () => {
  router.push('/qrcode')
}

const navigateToMarkdownHtmlConverter = () => {
  router.push('/markdown-html-converter')
}

const navigateToDrawingBoard = () => {
  router.push('/drawing-board')
}

const navigateToPomodoroTimer = () => {
  router.push('/pomodoro-timer')
}

const navigateToDataProcessor = () => {
  router.push('/data-processor')
}

const navigateToMathTool = () => {
  router.push('/math')
}

const navigateToIPLocation = () => {
  router.push('/ip-location')
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
  font-size: 3rem;
  color: var(--text-color);
}

.header button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.header button:hover {
  background-color: var(--primary-color-hover);
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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

.tool-card h2 {
  margin: 0 0 10px 0;
  color: var(--button-text-color);
}

.tool-card p {
  margin: 0;
  color: var(--text-color);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2.5rem;
  }

  .tool-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 2rem;
  }

  .tool-icon {
    font-size: 1.5rem;
  }
}

textarea {
  resize: vertical;
}
</style> 