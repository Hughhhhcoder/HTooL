<template>
  <div class="markdown-html-converter">
    <div class="converter-header">
      <h2>Markdown ↔ HTML 互转</h2>
      <div class="mode-switch">
        <button 
          :class="{ active: previewMode === 'HTML' }"
          @click="previewMode = 'HTML'"
        >
          HTML 预览
        </button>
        <button 
          :class="{ active: previewMode === 'Markdown' }"
          @click="previewMode = 'Markdown'"
        >
          Markdown 预览
        </button>
      </div>
    </div>
    
    <div class="converter-container">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-group">
          <h3>Markdown 输入</h3>
          <textarea 
            v-model="markdownInput" 
            placeholder="输入 Markdown 文本..."
            @input="convertToHtml"
          ></textarea>
          <button class="action-button" @click="clearInput('markdown')">
            <i class="fas fa-trash"></i> 清空
          </button>
        </div>
        
        <div class="input-group">
          <h3>HTML 输入</h3>
          <textarea 
            v-model="htmlInput" 
            placeholder="输入 HTML 代码..."
            @input="convertToMarkdown"
          ></textarea>
          <button class="action-button" @click="clearInput('html')">
            <i class="fas fa-trash"></i> 清空
          </button>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <h3>预览</h3>
          <div class="preview-actions">
            <button class="action-button" @click="copyOutput">
              <i class="fas fa-copy"></i> 复制
            </button>
            <button class="action-button" @click="downloadOutput">
              <i class="fas fa-download"></i> 下载
            </button>
          </div>
        </div>
        <div class="preview-content">
          <div v-if="previewMode === 'HTML'" v-html="htmlOutput" class="preview html-preview"></div>
          <div v-else class="preview markdown-preview">{{ markdownOutput }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { marked } from 'marked';
import TurndownService from 'turndown';

const markdownInput = ref('');
const htmlOutput = ref('');
const htmlInput = ref('');
const markdownOutput = ref('');
const previewMode = ref('HTML');

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
  linkReferenceStyle: 'full'
});

// 添加自定义规则
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});

const convertToHtml = () => {
  try {
    htmlOutput.value = marked(markdownInput.value, {
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    });
  } catch (error) {
    console.error('Markdown 转换错误:', error);
    htmlOutput.value = '<div class="error">转换出错，请检查输入内容</div>';
  }
};

const convertToMarkdown = () => {
  try {
    markdownOutput.value = turndownService.turndown(htmlInput.value);
  } catch (error) {
    console.error('HTML 转换错误:', error);
    markdownOutput.value = '转换出错，请检查输入内容';
  }
};

const clearInput = (type) => {
  if (type === 'markdown') {
    markdownInput.value = '';
    htmlOutput.value = '';
  } else {
    htmlInput.value = '';
    markdownOutput.value = '';
  }
};

const copyOutput = async () => {
  const text = previewMode.value === 'HTML' ? htmlOutput.value : markdownOutput.value;
  try {
    await navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    alert('复制失败，请手动复制');
  }
};

const downloadOutput = () => {
  const text = previewMode.value === 'HTML' ? htmlOutput.value : markdownOutput.value;
  const extension = previewMode.value === 'HTML' ? 'html' : 'md';
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `converted.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 监听输入变化
watch(markdownInput, () => {
  if (markdownInput.value) {
    convertToHtml();
  }
});

watch(htmlInput, () => {
  if (htmlInput.value) {
    convertToMarkdown();
  }
});
</script>

<style scoped>
.markdown-html-converter {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.converter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.converter-header h2 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--text-color);
}

.mode-switch {
  display: flex;
  gap: 1rem;
}

.mode-switch button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-switch button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.converter-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

textarea {
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-family: monospace;
  resize: vertical;
  transition: border-color 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.action-button {
  padding: 0.5rem 1rem;
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-color);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-content {
  flex: 1;
  min-height: 200px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  overflow: auto;
}

.preview {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.html-preview {
  font-family: system-ui, -apple-system, sans-serif;
}

.html-preview :deep(h1) {
  font-size: 2rem;
  margin: 1rem 0;
  color: var(--text-color);
}

.html-preview :deep(h2) {
  font-size: 1.5rem;
  margin: 0.8rem 0;
  color: var(--text-color);
}

.html-preview :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.html-preview :deep(code) {
  background: var(--code-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.html-preview :deep(pre) {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.html-preview :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  margin: 1rem 0;
  padding-left: 1rem;
  color: var(--text-color-secondary);
}

.html-preview :deep(ul), 
.html-preview :deep(ol) {
  padding-left: 2rem;
  margin: 0.5rem 0;
}

.html-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.html-preview :deep(th),
.html-preview :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5rem;
}

.html-preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-preview {
  font-family: monospace;
  white-space: pre;
}

@media (max-width: 768px) {
  .converter-container {
    grid-template-columns: 1fr;
  }
  
  .converter-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .mode-switch {
    width: 100%;
  }
  
  .mode-switch button {
    flex: 1;
  }
}
</style> 