<template>
  <section class="page markdown-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">Writing</p>
        <h1 class="page-title">Markdown 编辑器</h1>
        <p class="page-subtitle">文件管理、编辑、实时预览与本地保存整合为统一工作台。</p>
      </div>

      <div class="header-actions">
        <button class="btn" @click="toggleFileManager">
          {{ showFileManager ? '隐藏目录' : '显示目录' }}
        </button>
        <button class="btn btn-primary" @click="saveContent">保存</button>
      </div>
    </header>

    <div class="workspace">
      <aside class="panel sidebar" :class="{ open: showFileManager }">
        <div class="sidebar-head">
          <h2 class="section-title">文件管理</h2>
        </div>

        <div class="folder-actions">
          <button class="btn" @click="browseLocalFolder">打开文件夹</button>
          <button class="btn" @click="createNewFile" :disabled="!currentFolder?.handle">新建文件</button>
          <button class="btn" @click="createNewFolder" :disabled="!currentFolder?.handle">新建文件夹</button>
        </div>

        <div class="path-nav">
          <button
            v-for="(segment, index) in currentPathSegments"
            :key="segment.path + index"
            class="path-segment"
            @click="navigateToPath(segment.path)"
          >
            {{ segment.name }}
          </button>
        </div>

        <div class="file-tree">
          <article
            v-for="item in sortedItems"
            :key="item.path"
            class="file-item"
            :class="{ 'is-selected': currentFile?.path === item.path }"
          >
            <button class="file-entry" :style="{ paddingLeft: `${getItemPadding(item)}px` }" @click="handleItemClick(item)">
              <span class="file-icon">{{ getItemIcon(item) }}</span>
              <span class="file-name">{{ item.name }}</span>
            </button>

            <div class="file-row-actions">
              <button class="mini-btn" v-if="!item.isFolder" @click="editFile(item)">编辑</button>
              <button class="mini-btn" v-if="!item.isFolder" @click="deleteFile(item.path)">删除</button>
              <button class="mini-btn" v-if="item.isFolder" @click="navigateToPath(item.path)">进入</button>
              <button class="mini-btn" v-if="item.isFolder" @click="deleteFolder(item.path)">删除</button>
            </div>
          </article>

          <p v-if="sortedItems.length === 0" class="status">当前目录暂无文件</p>
        </div>
      </aside>

      <section class="panel editor-shell">
        <div class="toolbar">
          <div class="toolbar-row">
            <button class="btn" @click="formatText('bold')" title="加粗 (Ctrl+B)">加粗</button>
            <button class="btn" @click="formatText('italic')" title="斜体 (Ctrl+I)">斜体</button>
            <button class="btn" @click="formatText('heading', 1)">标题</button>
            <button class="btn" @click="formatText('quote')">引用</button>
            <button class="btn" @click="formatText('code')">代码</button>
            <button class="btn" @click="formatText('link')" title="链接 (Ctrl+K)">链接</button>
            <button class="btn" @click="formatText('image')">图片</button>
            <button class="btn" @click="formatText('list', 'unordered')">无序列表</button>
            <button class="btn" @click="formatText('list', 'ordered')">有序列表</button>
          </div>

          <div class="toolbar-row">
            <button class="btn" @click="toggleLivePreview">
              {{ isLivePreview ? '关闭实时预览' : '实时预览' }}
            </button>
            <button class="btn btn-primary" @click="togglePreview">
              {{ isPreview ? '编辑' : '预览' }}
            </button>
            <button class="btn" @click="saveContent">保存</button>
          </div>
        </div>

        <div class="editor-layout" :class="{ split: isLivePreview }">
          <div v-show="!isPreview" class="editor-wrap">
            <div
              class="editor mono"
              contenteditable="true"
              ref="editor"
              @input="handleInput"
              @keydown="handleKeydown"
              placeholder="开始编写 Markdown 文档..."
            ></div>
          </div>

          <div v-if="isLivePreview || isPreview" class="preview markdown-body" v-html="previewContent"></div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const editor = ref(null)
const content = ref('')
const previewContent = ref('')
const isPreview = ref(false)
const isLivePreview = ref(false)
const currentPath = ref('/')
const currentFile = ref(null)
const showFileManager = ref(false)

const isDesktop = ref(window.innerWidth >= 1024)

let markedLib = null
let dompurifyLib = null
let previewRenderToken = 0

const fileSystem = ref({
  root: {
    path: '/',
    name: '根目录',
    isFolder: true,
    children: {},
    expanded: true,
    handle: null
  }
})

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
  if (isDesktop.value) {
    showFileManager.value = true
  }
}

const ensureMarkdownRenderer = async () => {
  if (!markedLib) {
    const markedModule = await import('marked')
    markedLib = markedModule.marked
  }

  if (!dompurifyLib) {
    const dompurifyModule = await import('dompurify')
    dompurifyLib = dompurifyModule.default
  }
}

const renderPreview = async () => {
  const token = ++previewRenderToken
  const source = content.value || ''

  if (!source.trim()) {
    previewContent.value = ''
    return
  }

  try {
    await ensureMarkdownRenderer()
    const html = markedLib(source, {
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false
    })

    if (token !== previewRenderToken) return
    previewContent.value = dompurifyLib.sanitize(html)
  } catch (error) {
    if (token !== previewRenderToken) return
    previewContent.value = '<p class="preview-error">预览渲染失败，请检查 Markdown 内容。</p>'
  }
}

watch(content, () => {
  if (isLivePreview.value || isPreview.value) {
    void renderPreview()
  }
})

watch([isLivePreview, isPreview], ([live, preview]) => {
  if (live || preview) {
    void renderPreview()
  }
})

const handleInput = (event) => {
  content.value = event.target.textContent || ''
}

const handleKeydown = (event) => {
  if (event.key === 'Tab') {
    event.preventDefault()
    document.execCommand('insertText', false, '  ')
  }

  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        formatText('bold')
        break
      case 'i':
        event.preventDefault()
        formatText('italic')
        break
      case 'k':
        event.preventDefault()
        formatText('link')
        break
      default:
        break
    }
  }
}

const formatText = (type, level) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  const text = range.toString()

  let result = text
  switch (type) {
    case 'bold':
      result = `**${text}**`
      break
    case 'italic':
      result = `*${text}*`
      break
    case 'heading':
      result = `${'#'.repeat(level)} ${text}`
      break
    case 'quote':
      result = `> ${text}`
      break
    case 'code':
      result = `\`${text}\``
      break
    case 'link': {
      const url = prompt('请输入链接地址:', 'https://')
      if (url) result = `[${text || '链接文本'}](${url})`
      break
    }
    case 'image': {
      const imgUrl = prompt('请输入图片地址:', 'https://')
      if (imgUrl) result = `![${text || '图片描述'}](${imgUrl})`
      break
    }
    case 'list': {
      const prefix = level === 'ordered' ? '1. ' : '- '
      result = text.split('\n').map((line) => prefix + line).join('\n')
      break
    }
    default:
      break
  }

  if (result !== text) {
    range.deleteContents()
    range.insertNode(document.createTextNode(result))
  }
}

const toggleLivePreview = () => {
  isLivePreview.value = !isLivePreview.value
  if (isLivePreview.value) {
    isPreview.value = false
    void renderPreview()
  }
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
  if (isPreview.value) {
    isLivePreview.value = false
    void renderPreview()
  }
}

const saveContent = async () => {
  if (!currentFile.value || !currentFile.value.handle) {
    alert('请先选择一个文件')
    return
  }

  try {
    const writable = await currentFile.value.handle.createWritable()
    await writable.write(content.value || '')
    await writable.close()
    alert('文件已保存')
  } catch (error) {
    console.error('Error saving file:', error)
    alert('保存文件失败')
  }
}

const buildFolderChildren = async (dirHandle, parentPath = '') => {
  const children = {}

  for await (const [name, handle] of dirHandle.entries()) {
    const path = `${parentPath}/${name}`.replace(/\/+/g, '/')
    const item = {
      path,
      name,
      isFolder: handle.kind === 'directory',
      handle,
      modified: Date.now(),
      children: {},
      expanded: false
    }

    if (item.isFolder) {
      item.children = await buildFolderChildren(handle, path)
    }

    children[name] = item
  }

  return children
}

const browseLocalFolder = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    fileSystem.value.root.handle = dirHandle
    fileSystem.value.root.children = await buildFolderChildren(dirHandle, '')
    currentPath.value = '/'
    currentFile.value = null
    content.value = ''
    if (editor.value) {
      editor.value.textContent = ''
    }
  } catch (error) {
    console.error('Error browsing folder:', error)
  }
}

const getFolderByPath = (path) => {
  if (path === '/' || !path) return fileSystem.value.root

  const parts = path.split('/').filter(Boolean)
  let current = fileSystem.value.root

  for (const part of parts) {
    if (!current.children[part] || !current.children[part].isFolder) {
      return null
    }
    current = current.children[part]
  }

  return current
}

const currentFolder = computed(() => getFolderByPath(currentPath.value))

const currentPathSegments = computed(() => {
  const segments = [{ name: '根目录', path: '/' }]
  if (!currentPath.value) return segments

  const parts = currentPath.value.split('/').filter(Boolean)
  let path = ''

  for (const part of parts) {
    path += '/' + part
    segments.push({
      name: part,
      path
    })
  }

  return segments
})

const sortedItems = computed(() => {
  const folder = currentFolder.value
  if (!folder?.children) return []

  const items = Object.values(folder.children)
  return items.sort((a, b) => {
    if (a.isFolder === b.isFolder) {
      return a.name.localeCompare(b.name)
    }
    return a.isFolder ? -1 : 1
  })
})

const getItemIcon = (item) => {
  if (!item) return '•'
  if (item.isFolder) return item.expanded ? '▾' : '▸'
  return '•'
}

const getItemPadding = (item) => {
  if (!item?.path || !currentPath.value) return 10
  const itemDepth = item.path.split('/').filter(Boolean).length
  const folderDepth = currentPath.value.split('/').filter(Boolean).length
  return Math.max(10, 10 + (itemDepth - folderDepth - 1) * 14)
}

const navigateToPath = (path) => {
  currentPath.value = path
}

const createNewFile = async () => {
  const fileName = prompt('请输入文件名:', 'new-file.md')
  if (!fileName) return

  const folder = getFolderByPath(currentPath.value)
  if (!folder || !folder.handle) {
    alert('请先选择一个文件夹')
    return
  }

  try {
    const fileHandle = await folder.handle.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write('')
    await writable.close()

    const path = `${currentPath.value}/${fileName}`.replace(/\/+/g, '/')
    const newFile = {
      path,
      name: fileName,
      isFolder: false,
      handle: fileHandle,
      content: '',
      modified: Date.now()
    }

    folder.children[fileName] = newFile
    currentFile.value = newFile
    content.value = ''
    if (editor.value) {
      editor.value.textContent = ''
    }
  } catch (error) {
    console.error('Error creating file:', error)
    alert('创建文件失败')
  }
}

const editFile = async (file) => {
  if (!file.handle) return

  try {
    const fileData = await file.handle.getFile()
    const fileContent = await fileData.text()

    currentFile.value = file
    content.value = fileContent || ''
    if (editor.value) {
      editor.value.textContent = content.value
    }
  } catch (error) {
    console.error('Error reading file:', error)
    alert('读取文件失败')
  }
}

const deleteFile = async (path) => {
  if (!confirm('确定要删除这个文件吗？')) return

  const parts = path.split('/').filter(Boolean)
  const fileName = parts.pop()
  const folderPath = '/' + parts.join('/')
  const folder = getFolderByPath(folderPath)

  if (!folder || !folder.handle) return

  try {
    await folder.handle.removeEntry(fileName)
    delete folder.children[fileName]

    if (currentFile.value?.path === path) {
      currentFile.value = null
      content.value = ''
      if (editor.value) {
        editor.value.textContent = ''
      }
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    alert('删除文件失败')
  }
}

const createNewFolder = async () => {
  const folderName = prompt('请输入文件夹名称:')
  if (!folderName) return

  const folder = getFolderByPath(currentPath.value)
  if (!folder || !folder.handle) {
    alert('请先选择一个文件夹')
    return
  }

  try {
    const folderHandle = await folder.handle.getDirectoryHandle(folderName, { create: true })
    const path = `${currentPath.value}/${folderName}`.replace(/\/+/g, '/')

    folder.children[folderName] = {
      path,
      name: folderName,
      isFolder: true,
      handle: folderHandle,
      children: {},
      expanded: false,
      modified: Date.now()
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    alert('创建文件夹失败')
  }
}

const deleteFolder = async (path) => {
  if (!confirm('确定要删除这个文件夹吗？所有子文件和文件夹都会被删除。')) return

  const parts = path.split('/').filter(Boolean)
  const folderName = parts.pop()
  const parentPath = '/' + parts.join('/')
  const parentFolder = getFolderByPath(parentPath)

  if (!parentFolder || !parentFolder.handle) return

  try {
    await parentFolder.handle.removeEntry(folderName, { recursive: true })
    delete parentFolder.children[folderName]

    if (currentPath.value.startsWith(path)) {
      currentPath.value = parentPath || '/'
    }
  } catch (error) {
    console.error('Error deleting folder:', error)
    alert('删除文件夹失败')
  }
}

const handleItemClick = (item) => {
  if (item.isFolder) {
    item.expanded = !item.expanded
    currentPath.value = item.path
  } else {
    editFile(item)
  }
}

const toggleFileManager = () => {
  showFileManager.value = !showFileManager.value
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.markdown-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workspace {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 320px minmax(0, 1fr);
}

.sidebar {
  padding: var(--space-4);
  max-height: calc(100vh - 190px);
  overflow: auto;
}

.sidebar-head {
  margin-bottom: 12px;
}

.folder-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 14px;
}

.path-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.path-segment {
  border: 1px solid var(--border-weak);
  border-radius: 999px;
  background: var(--surface-base);
  color: var(--text-secondary);
  padding: 4px 10px;
  font-size: 0.78rem;
  cursor: pointer;
}

.file-tree {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--surface-base);
}

.file-item.is-selected {
  border-color: var(--border-strong);
}

.file-entry {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
}

.file-icon {
  width: 14px;
  color: var(--text-tertiary);
  flex: 0 0 auto;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-row-actions {
  display: flex;
  gap: 6px;
  padding: 0 10px 10px;
}

.mini-btn {
  border: 1px solid var(--border-weak);
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
}

.editor-shell {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100vh - 190px);
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  padding: 10px;
  background: var(--surface-base);
}

.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.editor-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  min-height: 520px;
}

.editor-layout.split {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.editor-wrap,
.preview {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--surface-base);
  min-height: 520px;
}

.editor {
  min-height: 520px;
  padding: var(--space-4);
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.editor:empty::before {
  content: attr(placeholder);
  color: var(--text-tertiary);
}

.preview {
  overflow: auto;
  padding: var(--space-4);
  color: var(--text-secondary);
}

.preview :deep(.preview-error) {
  color: var(--danger);
}

.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3) {
  color: var(--text-primary);
}

.preview :deep(code) {
  background: var(--surface-card);
  border: 1px solid var(--border-weak);
  border-radius: 6px;
  padding: 2px 6px;
}

.preview :deep(pre) {
  background: var(--surface-card);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  padding: var(--space-4);
  overflow: auto;
}

.preview :deep(blockquote) {
  margin: 0;
  border-left: 3px solid var(--border-strong);
  padding-left: 12px;
}

@media (max-width: 1100px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .sidebar.open {
    display: block;
    max-height: none;
  }

  .editor-shell {
    min-height: auto;
  }

  .editor-layout,
  .editor-wrap,
  .preview,
  .editor {
    min-height: 420px;
  }

  .editor-layout.split {
    grid-template-columns: 1fr;
  }
}
</style>
