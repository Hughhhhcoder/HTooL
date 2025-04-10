<template>
  <div class="markdown-html-converter">
    <h2>Markdown ↔ HTML 互转</h2>
    
    <!-- 输入区域 -->
    <div class="input-section">
      <textarea v-model="markdownInput" placeholder="输入 Markdown"></textarea>
      <button @click="convertToHtml">转换为 HTML</button>
      <textarea v-model="htmlInput" placeholder="输入 HTML"></textarea>
      <button @click="convertToMarkdown">转换为 Markdown</button>
    </div>

    <!-- 预览区域 -->
    <div class="preview-section">
      <button @click="togglePreview">切换预览 ({{ previewMode }})</button>
      <div v-if="previewMode === 'HTML'" v-html="htmlOutput" class="preview"></div>
      <div v-if="previewMode === 'Markdown'" class="preview">{{ markdownOutput }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { marked } from 'marked';
import TurndownService from 'turndown';

const markdownInput = ref('');
const htmlOutput = ref('');
const htmlInput = ref('');
const markdownOutput = ref('');
const previewMode = ref('HTML');

const turndownService = new TurndownService();

turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});

const convertToHtml = () => {
  htmlOutput.value = marked(markdownInput.value);
};

const convertToMarkdown = () => {
  markdownOutput.value = turndownService.turndown(htmlInput.value);
};

const togglePreview = () => {
  previewMode.value = previewMode.value === 'HTML' ? 'Markdown' : 'HTML';
};
</script>

<style scoped>
.markdown-html-converter {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.input-section {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  resize: vertical;
}

button {
  margin: 10px 0;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #0056b3;
}

.preview-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 