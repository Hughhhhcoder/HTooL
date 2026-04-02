<template>
  <section class="page converter-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">Writing</p>
        <h1 class="page-title">Markdown ↔ HTML 转换</h1>
        <p class="page-subtitle">双向编辑并实时预览，支持复制与下载输出。</p>
      </div>

      <div class="mode-switch">
        <button
          class="btn"
          :class="{ 'btn-primary': previewMode === 'HTML' }"
          @click="previewMode = 'HTML'"
        >
          HTML 预览
        </button>
        <button
          class="btn"
          :class="{ 'btn-primary': previewMode === 'Markdown' }"
          @click="previewMode = 'Markdown'"
        >
          Markdown 预览
        </button>
      </div>
    </header>

    <div class="layout">
      <section class="panel block">
        <h2 class="section-title">输入区</h2>
        <div class="input-stack">
          <div class="input-group">
            <label>Markdown 输入</label>
            <textarea
              v-model="markdownInput"
              placeholder="输入 Markdown 文本..."
              @input="convertToHtml"
            ></textarea>
            <button class="btn" @click="clearInput('markdown')">清空 Markdown</button>
          </div>

          <div class="input-group">
            <label>HTML 输入</label>
            <textarea
              v-model="htmlInput"
              placeholder="输入 HTML 代码..."
              @input="convertToMarkdown"
            ></textarea>
            <button class="btn" @click="clearInput('html')">清空 HTML</button>
          </div>
        </div>
      </section>

      <section class="panel block">
        <div class="preview-header">
          <h2 class="section-title">预览区</h2>
          <div class="preview-actions">
            <button class="btn" @click="copyOutput">复制</button>
            <button class="btn btn-primary" @click="downloadOutput">下载</button>
          </div>
        </div>

        <div class="preview-shell">
          <div v-if="previewMode === 'HTML'" v-html="htmlOutput" class="preview html-preview"></div>
          <div v-else class="preview markdown-preview mono">{{ markdownOutput }}</div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  markedRenderOptions,
  turndownOptions,
  strikethroughReplacement
} from '../utils/markdownHtml'

const markdownInput = ref('')
const htmlOutput = ref('')
const htmlInput = ref('')
const markdownOutput = ref('')
const previewMode = ref('HTML')

let markedLib = null
let turndownService = null

const ensureMarked = async () => {
  if (markedLib) return markedLib
  const markedModule = await import('marked')
  markedLib = markedModule.marked
  return markedLib
}

const ensureTurndown = async () => {
  if (turndownService) return turndownService
  const { default: TurndownService } = await import('turndown')

  turndownService = new TurndownService(turndownOptions)

  turndownService.addRule('strikethrough', {
    filter: ['del', 's'],
    replacement(content) {
      return strikethroughReplacement(content)
    }
  })

  return turndownService
}

const convertToHtml = async () => {
  try {
    const marked = await ensureMarked()
    htmlOutput.value = marked(markdownInput.value, markedRenderOptions)
  } catch (error) {
    console.error('Markdown 转换错误:', error)
    htmlOutput.value = '<div class="preview-error">转换出错，请检查输入内容</div>'
  }
}

const convertToMarkdown = async () => {
  try {
    const converter = await ensureTurndown()
    markdownOutput.value = converter.turndown(htmlInput.value)
  } catch (error) {
    console.error('HTML 转换错误:', error)
    markdownOutput.value = '转换出错，请检查输入内容'
  }
}

const clearInput = (type) => {
  if (type === 'markdown') {
    markdownInput.value = ''
    htmlOutput.value = ''
  } else {
    htmlInput.value = ''
    markdownOutput.value = ''
  }
}

const copyOutput = async () => {
  const text = previewMode.value === 'HTML' ? htmlOutput.value : markdownOutput.value
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}

const downloadOutput = () => {
  const text = previewMode.value === 'HTML' ? htmlOutput.value : markdownOutput.value
  const extension = previewMode.value === 'HTML' ? 'html' : 'md'
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `converted.${extension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

watch(markdownInput, () => {
  if (markdownInput.value) {
    convertToHtml()
  } else {
    htmlOutput.value = ''
  }
})

watch(htmlInput, () => {
  if (htmlInput.value) {
    convertToMarkdown()
  } else {
    markdownOutput.value = ''
  }
})
</script>

<style scoped>
.converter-page {
  display: flex;
  flex-direction: column;
}

.mode-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.block {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-shell {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--surface-base);
  min-height: 320px;
  overflow: auto;
}

.preview {
  padding: var(--space-5);
  color: var(--text-secondary);
}

.html-preview :deep(.preview-error) {
  color: var(--danger);
}

.html-preview :deep(h1),
.html-preview :deep(h2),
.html-preview :deep(h3) {
  color: var(--text-primary);
}

.html-preview :deep(code) {
  background: var(--surface-card);
  border: 1px solid var(--border-weak);
  padding: 2px 6px;
  border-radius: 6px;
}

.html-preview :deep(pre) {
  background: var(--surface-card);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
  overflow: auto;
}

.html-preview :deep(blockquote) {
  border-left: 3px solid var(--border-strong);
  margin: 0;
  padding-left: 12px;
}

.markdown-preview {
  white-space: pre-wrap;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .block {
    padding: var(--space-4);
  }

  .preview-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
