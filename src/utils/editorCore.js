import { ref, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// 编辑器状态
const editorState = ref({
  content: '',
  isLivePreview: true,
  fontSize: 16,
  fontFamily: 'system-ui',
  theme: 'github',
  autoSave: true,
  autoSaveInterval: 30000 // 30秒
})

// 格式化功能
const formatText = (format, level) => {
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  
  const formats = {
    bold: '**',
    italic: '_',
    strikethrough: '~~',
    code: '`',
    link: () => {
      const url = prompt('请输入链接地址:', 'https://')
      if (url) {
        return `[${selectedText || '链接文本'}](${url})`
      }
      return selectedText
    },
    image: () => {
      const url = prompt('请输入图片地址:', 'https://')
      if (url) {
        return `![${selectedText || '图片描述'}](${url})`
      }
      return selectedText
    },
    heading: (level) => {
      const prefix = '#'.repeat(level) + ' '
      return selectedText ? prefix + selectedText : prefix
    },
    quote: () => {
      return selectedText.split('\n').map(line => '> ' + line).join('\n')
    },
    list: (type) => {
      const prefix = type === 'ordered' ? '1. ' : '- '
      return selectedText.split('\n').map(line => prefix + line).join('\n')
    },
    codeBlock: () => {
      const language = prompt('请输入代码语言:', '')
      return `\`\`\`${language}\n${selectedText}\n\`\`\``
    }
  }

  if (formats[format]) {
    const result = typeof formats[format] === 'function' 
      ? formats[format](level) 
      : formats[format] + selectedText + formats[format]
    
    document.execCommand('insertText', false, result)
  }
}

// 查找与替换
const findAndReplace = {
  findText: ref(''),
  replaceText: ref(''),
  isFindOpen: ref(false),
  isReplaceOpen: ref(false),
  
  findNext() {
    if (!this.findText.value) return
    
    const text = editorState.value.content
    const index = text.indexOf(this.findText.value)
    if (index !== -1) {
      const range = document.createRange()
      range.setStart(editorState.value.editor.firstChild, index)
      range.setEnd(editorState.value.editor.firstChild, index + this.findText.value.length)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      editorState.value.editor.scrollIntoView({ block: 'center' })
    }
  },
  
  replaceNext() {
    if (!this.findText.value || !this.replaceText.value) return
    
    const selection = window.getSelection()
    if (selection.toString() === this.findText.value) {
      document.execCommand('insertText', false, this.replaceText.value)
    }
    this.findNext()
  },
  
  replaceAll() {
    if (!this.findText.value || !this.replaceText.value) return
    
    const text = editorState.value.content
    const newText = text.replace(new RegExp(this.findText.value, 'g'), this.replaceText.value)
    editorState.value.content = newText
  }
}

// 语法高亮
const highlightSyntax = (content) => {
  return marked(content, {
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
    breaks: true,
    gfm: true
  })
}

// 实时预览
const updatePreview = (content) => {
  if (editorState.value.isLivePreview) {
    const html = DOMPurify.sanitize(highlightSyntax(content))
    editorState.value.preview.innerHTML = html
  }
}

// 自动保存
let autoSaveTimer = null
const startAutoSave = (saveCallback) => {
  if (editorState.value.autoSave) {
    autoSaveTimer = setInterval(() => {
      if (editorState.value.content) {
        saveCallback()
      }
    }, editorState.value.autoSaveInterval)
  }
}

const stopAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
    autoSaveTimer = null
  }
}

// 监听内容变化
watch(() => editorState.value.content, (newContent) => {
  updatePreview(newContent)
})

export {
  editorState,
  formatText,
  findAndReplace,
  highlightSyntax,
  updatePreview,
  startAutoSave,
  stopAutoSave
} 