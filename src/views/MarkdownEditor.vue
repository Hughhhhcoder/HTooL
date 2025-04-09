<template>
  <div class="markdown-editor">
    <div class="editor-header">
      <div class="file-actions">
        <input 
          type="file" 
          id="fileInput" 
          ref="fileInput"
          accept=".md,.markdown,.txt"
          @change="handleFileSelect"
          style="display: none"
        />
        <button @click="openFile" class="action-btn">
          <i class="fas fa-folder-open"></i> 打开文件
        </button>
        <button @click="saveFile" class="action-btn">
          <i class="fas fa-save"></i> 保存文件
        </button>
      </div>
      <div class="view-toggle">
        <button 
          :class="['toggle-btn', { active: viewMode === 'edit' }]"
          @click="viewMode = 'edit'"
        >
          编辑
        </button>
        <button 
          :class="['toggle-btn', { active: viewMode === 'preview' }]"
          @click="viewMode = 'preview'"
        >
          预览
        </button>
        <button 
          :class="['toggle-btn', { active: viewMode === 'split' }]"
          @click="viewMode = 'split'"
        >
          分屏
        </button>
      </div>
    </div>

    <div class="editor-content" :class="viewMode">
      <div class="editor-section" v-show="viewMode !== 'preview'">
        <textarea
          v-model="content"
          placeholder="开始编写 Markdown 文档..."
          @input="updatePreview"
        ></textarea>
      </div>
      <div class="preview-section" v-show="viewMode !== 'edit'">
        <div class="markdown-body" v-html="previewContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import 'github-markdown-css/github-markdown.css'

const router = useRouter()

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true,
  headerIds: false
})

const content = ref('')
const previewContent = ref('')
const viewMode = ref('split')
const fileInput = ref(null)

const goBack = () => {
  router.push('/')
}

const updatePreview = () => {
  previewContent.value = DOMPurify.sanitize(marked(content.value))
}

// 打开文件
const openFile = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      content.value = e.target.result
      updatePreview()
    }
    reader.readAsText(file)
  }
}

// 保存文件
const saveFile = () => {
  const blob = new Blob([content.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.md'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 初始化
onMounted(() => {
  // 添加移动端样式
  const style = document.createElement('style')
  style.textContent = `
    @media (max-width: 768px) {
      .markdown-editor {
        padding: 10px;
      }
      
      .editor-header {
        flex-direction: column;
        gap: 10px;
      }
      
      .file-actions, .view-toggle {
        width: 100%;
        justify-content: center;
      }
      
      .editor-content {
        height: calc(100vh - 120px);
        padding: 10px;
      }
      
      .editor-content.split {
        flex-direction: column;
      }
      
      .editor-section, .preview-section {
        height: 50%;
        min-height: 200px;
      }
      
      .markdown-body {
        font-size: 16px;
        line-height: 1.6;
        padding: 15px;
      }
      
      .markdown-body h1 {
        font-size: 24px;
      }
      
      .markdown-body h2 {
        font-size: 20px;
      }
      
      .markdown-body h3 {
        font-size: 18px;
      }
      
      .markdown-body p, .markdown-body li {
        font-size: 16px;
      }
      
      .markdown-body code {
        font-size: 14px;
      }
      
      .markdown-body pre {
        font-size: 14px;
        padding: 10px;
      }
      
      .markdown-body table {
        font-size: 14px;
      }
      
      .markdown-body img {
        max-width: 100%;
        height: auto;
      }
      
      .action-btn, .toggle-btn, .back-btn {
        font-size: 14px;
        padding: 6px 10px;
      }
    }
  `
  document.head.appendChild(style)
})
</script>

<style scoped>
.markdown-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.editor-header {
  padding: 10px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.file-actions, .view-toggle {
  display: flex;
  gap: 10px;
}

.action-btn, .toggle-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

.action-btn:hover, .toggle-btn:hover {
  background-color: #f8f9fa;
  color: #000;
}

.toggle-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.back-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}

.back-btn:hover {
  background-color: #f8f9fa;
  color: #000;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.editor-content.edit {
  flex-direction: column;
}

.editor-content.preview {
  flex-direction: column;
}

.editor-content.split {
  flex-direction: column;
}

.editor-section, .preview-section {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  min-height: 200px;
}

textarea {
  width: 100%;
  height: 100%;
  padding: 15px;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
}

textarea:focus {
  outline: none;
}

.markdown-body {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

/* 桌面端分屏布局 */
@media (min-width: 769px) {
  .editor-content.split {
    flex-direction: row;
  }
  
  .editor-section, .preview-section {
    flex: 1;
    min-height: auto;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .markdown-editor {
    padding: 10px;
  }
  
  .editor-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .file-actions, .view-toggle {
    width: 100%;
    justify-content: center;
  }
  
  .editor-content {
    height: calc(100vh - 120px);
    padding: 10px;
  }
  
  .editor-content.split {
    flex-direction: column;
  }
  
  .editor-section, .preview-section {
    height: 50%;
    min-height: 200px;
  }
  
  .markdown-body {
    font-size: 16px;
    line-height: 1.6;
    padding: 15px;
  }
  
  .markdown-body h1 {
    font-size: 24px;
  }
  
  .markdown-body h2 {
    font-size: 20px;
  }
  
  .markdown-body h3 {
    font-size: 18px;
  }
  
  .markdown-body p, .markdown-body li {
    font-size: 16px;
  }
  
  .markdown-body code {
    font-size: 14px;
  }
  
  .markdown-body pre {
    font-size: 14px;
    padding: 10px;
  }
  
  .markdown-body table {
    font-size: 14px;
  }
  
  .markdown-body img {
    max-width: 100%;
    height: auto;
  }
  
  .action-btn, .toggle-btn, .back-btn {
    font-size: 14px;
    padding: 6px 10px;
  }
}
</style> 