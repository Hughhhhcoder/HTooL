<template>
  <div class="markdown-editor" :data-view="isEditorView ? 'editor' : 'files'">
    <!-- 移动端顶部导航栏 -->
    <div class="mobile-nav" v-if="isMobile">
      <button class="menu-button" @click="toggleFileManager">
        <i class="fas fa-bars"></i>
      </button>
      <h2 class="mobile-title">Markdown 编辑器</h2>
    </div>

    <!-- 遮罩层 -->
    <div class="overlay" :class="{ show: showFileManager }" @click="toggleFileManager"></div>

    <div class="main-content">
      <!-- 文件管理器 -->
      <div class="file-manager" :class="{ 'show': showFileManager, 'collapsed': !showFileManager }">
        <div class="file-header">
          <h3>文件管理</h3>
          <div class="header-actions">
            <button class="toggle-button" @click="showFileManager = !showFileManager">
              <i :class="showFileManager ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
            </button>
          </div>
        </div>
        
        <!-- 当前路径导航 -->
        <div class="path-navigator">
          <button 
            v-for="(segment, index) in currentPathSegments" 
            :key="index"
            @click="navigateToPath(segment.path)"
            class="path-segment"
          >
            {{ segment.name }}
            <i class="fas fa-chevron-right" v-if="index < currentPathSegments.length - 1"></i>
          </button>
        </div>

        <div class="file-actions">
          <button @click="browseLocalFolder" class="action-button">
            <i class="fas fa-folder-open"></i>
            <span>打开文件夹</span>
          </button>
          <button @click="createNewFile" class="action-button" :disabled="!currentFolder?.handle">
            <i class="fas fa-file"></i>
            <span>新建文件</span>
          </button>
          <button @click="createNewFolder" class="action-button" :disabled="!currentFolder?.handle">
            <i class="fas fa-folder-plus"></i>
            <span>新建文件夹</span>
          </button>
        </div>
        
        <!-- 文件树 -->
        <div class="file-tree">
          <template v-if="currentFolder">
            <div 
              v-for="item in sortedItems"
              :key="item.path"
              class="file-item"
              :class="{ 
                'is-folder': item.isFolder,
                'is-expanded': item.expanded,
                'is-selected': currentFile?.path === item.path
              }"
              :style="{ paddingLeft: getItemPadding(item) + 'px' }"
              @click="handleItemClick(item)"
            >
              <i :class="getItemIcon(item)"></i>
              <span class="file-name">{{ item.name }}</span>
              <div class="file-actions" v-if="!item.isFolder">
                <button @click.stop="editFile(item)" class="action-button">
                  <i class="fas fa-edit"></i>
                  <span>编辑</span>
                </button>
                <button @click.stop="deleteFile(item.path)" class="action-button">
                  <i class="fas fa-trash"></i>
                  <span>删除</span>
                </button>
              </div>
              <div class="folder-actions" v-else>
                <button @click.stop="createNewFile" class="action-button">
                  <i class="fas fa-file"></i>
                  <span>新建</span>
                </button>
                <button @click.stop="deleteFolder(item.path)" class="action-button">
                  <i class="fas fa-trash"></i>
                  <span>删除</span>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 编辑器容器 -->
      <div class="editor-container" :class="{ 'focus-mode': focusMode }">
        <div class="toolbar">
          <div class="format-buttons">
            <button @click="formatText('bold')" title="加粗 (Ctrl+B)">
              <i class="fas fa-bold"></i>
              <span>加粗</span>
            </button>
            <button @click="formatText('italic')" title="斜体 (Ctrl+I)">
              <i class="fas fa-italic"></i>
              <span>斜体</span>
            </button>
            <button @click="formatText('heading', 1)" title="标题">
              <i class="fas fa-heading"></i>
              <span>标题</span>
            </button>
            <button @click="formatText('quote')" title="引用">
              <i class="fas fa-quote-right"></i>
              <span>引用</span>
            </button>
            <button @click="formatText('code')" title="代码">
              <i class="fas fa-code"></i>
              <span>代码</span>
            </button>
            <button @click="formatText('link')" title="链接 (Ctrl+K)">
              <i class="fas fa-link"></i>
              <span>链接</span>
            </button>
            <button @click="formatText('image')" title="图片">
              <i class="fas fa-image"></i>
              <span>图片</span>
            </button>
            <button @click="formatText('list', 'unordered')" title="无序列表">
              <i class="fas fa-list-ul"></i>
              <span>无序列表</span>
            </button>
            <button @click="formatText('list', 'ordered')" title="有序列表">
              <i class="fas fa-list-ol"></i>
              <span>有序列表</span>
            </button>
          </div>
          <div class="view-buttons">
            <button @click="toggleLivePreview" title="实时预览">
              <i :class="isLivePreview ? 'fas fa-columns' : 'fas fa-columns'"></i>
              <span>{{ isLivePreview ? '关闭实时预览' : '实时预览' }}</span>
            </button>
            <button @click="togglePreview" title="预览">
              <i :class="isPreview ? 'fas fa-edit' : 'fas fa-eye'"></i>
              <span>{{ isPreview ? '编辑' : '预览' }}</span>
            </button>
            <button @click="saveContent" title="保存">
              <i class="fas fa-save"></i>
              <span>保存</span>
            </button>
          </div>
        </div>
        <div class="editor-content" :class="{ 'live-preview': isLivePreview }">
          <div class="editor-wrapper" :class="{ 'split-view': isLivePreview }">
            <div 
              v-show="!isPreview"
              class="editor" 
              contenteditable="true"
              @input="handleInput"
              @keydown="handleKeydown"
              ref="editor"
              :placeholder="'开始编写 Markdown 文档...'"
            ></div>
            <div 
              v-if="isLivePreview"
              class="preview markdown-body" 
              v-html="previewContent"
            ></div>
            <div 
              v-show="isPreview && !isLivePreview"
              class="preview markdown-body" 
              v-html="previewContent"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 基础状态
const editor = ref(null)
const content = ref('')
const isPreview = ref(false)
const isLivePreview = ref(false)
const currentPath = ref('/')
const currentFile = ref(null)
const showFileManager = ref(false)
const focusMode = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const isEditorView = ref(true)

// 文件系统状态
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

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showFileManager.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const previewContent = computed(() => {
  return DOMPurify.sanitize(marked(content.value))
})

// 监听内容变化，实时更新预览
watch(() => content.value, (newContent) => {
  if (isLivePreview.value) {
    previewContent.value = DOMPurify.sanitize(marked(newContent))
  }
})

const handleInput = (e) => {
  content.value = e.target.textContent
}

const handleKeydown = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '  ')
  }
  
  if (e.ctrlKey || e.metaKey) {
    switch(e.key.toLowerCase()) {
      case 'b':
        e.preventDefault()
        formatText('bold')
        break
      case 'i':
        e.preventDefault()
        formatText('italic')
        break
      case 'k':
        e.preventDefault()
        formatText('link')
        break
    }
  }
}

const formatText = (type, level) => {
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const text = range.toString()
  
  let result = text
  switch(type) {
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
    case 'link':
      const url = prompt('请输入链接地址:', 'https://')
      if (url) result = `[${text || '链接文本'}](${url})`
      break
    case 'image':
      const imgUrl = prompt('请输入图片地址:', 'https://')
      if (imgUrl) result = `![${text || '图片描述'}](${imgUrl})`
      break
    case 'list':
      const prefix = level === 'ordered' ? '1. ' : '- '
      result = text.split('\n').map(line => prefix + line).join('\n')
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
  }
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
  if (isPreview.value) {
    isLivePreview.value = false
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

// 浏览本地文件夹
const browseLocalFolder = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    await loadFolder(dirHandle)
  } catch (error) {
    console.error('Error browsing folder:', error)
  }
}

// 导入文件夹
const importFolder = async () => {
  try {
    const dirHandle = await window.showDirectoryPicker()
    await loadFolder(dirHandle)
  } catch (error) {
    console.error('Error importing folder:', error)
  }
}

// 加载文件夹内容
const loadFolder = async (dirHandle, parentPath = '') => {
  const children = {}
  
  for await (const [name, handle] of dirHandle.entries()) {
    const path = `${parentPath}/${name}`.replace(/\/+/g, '/')
    const item = {
      path,
      name,
      isFolder: handle.kind === 'directory',
      handle,
      modified: new Date().getTime(),
      children: {},
      expanded: false
    }
    
    if (item.isFolder) {
      try {
        await loadFolder(handle, path)
      } catch (error) {
        console.error(`Error loading subfolder ${path}:`, error)
      }
    }
    
    children[name] = item
  }
  
  if (parentPath === '') {
    fileSystem.value.root.children = children
    fileSystem.value.root.handle = dirHandle
  } else {
    const folder = getFolderByPath(parentPath)
    if (folder) {
      folder.children = children
      folder.handle = dirHandle
    }
  }
}

// 根据路径获取文件夹
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

// 计算当前文件夹
const currentFolder = computed(() => getFolderByPath(currentPath.value))

// 计算当前路径段
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

// 计算排序后的文件和文件夹
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

// 获取文件/文件夹图标
const getItemIcon = (item) => {
  if (!item) return 'fas fa-file'
  if (item.isFolder) {
    return item.expanded ? 'fas fa-folder-open' : 'fas fa-folder'
  }
  return 'fas fa-file'
}

// 获取缩进
const getItemPadding = (item) => {
  if (!item?.path || !currentPath.value) return 12
  return (item.path.split('/').length - currentPath.value.split('/').length) * 20 + 12
}

// 导航到指定路径
const navigateToPath = (path) => {
  currentPath.value = path
}

// 创建新文件
const createNewFile = async () => {
  const fileName = prompt('请输入文件名:', 'new-file.md')
  if (!fileName) return
  
  const currentFolder = getFolderByPath(currentPath.value)
  if (!currentFolder || !currentFolder.handle) {
    alert('请先选择一个文件夹')
    return
  }
  
  try {
    const fileHandle = await currentFolder.handle.getFileHandle(fileName, { create: true })
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
      modified: new Date().getTime()
    }
    
    currentFolder.children[fileName] = newFile
    
    // 先设置当前文件，再设置内容
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

// 编辑文件
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

// 删除文件
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
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    alert('删除文件失败')
  }
}

// 处理文件项点击
const handleItemClick = (item) => {
  if (item.isFolder) {
    item.expanded = !item.expanded
    currentPath.value = item.path
  } else {
    editFile(item)
  }
}

// 渲染文件树
const renderFileTree = (items, level = 0) => {
  return Object.values(items).map(item => {
    const indent = '  '.repeat(level)
    const hasChildren = item.isFolder && Object.keys(item.children).length > 0
    
    return `
      <div 
        class="file-item"
        :class="{ 
          'is-folder': item.isFolder,
          'is-expanded': item.expanded,
          'is-selected': currentFile?.path === item.path
        }"
        :style="{ paddingLeft: '${level * 20}px' }"
        @click="handleItemClick(item)"
      >
        <i :class="item.isFolder ? (item.expanded ? 'fas fa-folder-open' : 'fas fa-folder') : 'fas fa-file'"></i>
        <span class="file-name">{{ item.name }}</span>
        <div class="file-actions" v-if="!item.isFolder">
          <button @click.stop="editFile(item)" class="action-button">
            <i class="fas fa-edit"></i>
            <span>编辑</span>
          </button>
          <button @click.stop="deleteFile(item.path)" class="action-button">
            <i class="fas fa-trash"></i>
            <span>删除</span>
          </button>
        </div>
      </div>
      ${hasChildren && item.expanded ? renderFileTree(item.children, level + 1) : ''}
    `
  }).join('')
}

// 创建新文件夹
const createNewFolder = async () => {
  const folderName = prompt('请输入文件夹名称:')
  if (!folderName) return
  
  const currentFolder = getFolderByPath(currentPath.value)
  if (!currentFolder || !currentFolder.handle) {
    alert('请先选择一个文件夹')
    return
  }
  
  try {
    const folderHandle = await currentFolder.handle.getDirectoryHandle(folderName, { create: true })
    const path = `${currentPath.value}/${folderName}`.replace(/\/+/g, '/')
    
    currentFolder.children[folderName] = {
      path,
      name: folderName,
      isFolder: true,
      handle: folderHandle,
      children: {},
      expanded: false,
      modified: new Date().getTime()
    }
  } catch (error) {
    console.error('Error creating folder:', error)
    alert('创建文件夹失败')
  }
}

// 删除文件夹
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
      currentPath.value = parentPath
    }
  } catch (error) {
    console.error('Error deleting folder:', error)
    alert('删除文件夹失败')
  }
}

// 切换文件管理器显示状态
const toggleFileManager = () => {
  showFileManager.value = !showFileManager.value
}

// 监听视图变化
watch(isEditorView, (newValue) => {
  if (isMobile.value) {
    showFileManager.value = !newValue
  }
})
</script>

<style scoped>
.markdown-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 文件管理器 */
.file-manager {
  width: 300px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.file-manager.collapsed {
  transform: translateX(-100%);
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.file-actions {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-tree {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  margin: 2px 0;
  position: relative;
}

.file-item:hover {
  background: #f8f9fa;
}

.file-item.is-selected {
  background: #e9ecef;
}

.file-item i {
  width: 20px;
  text-align: center;
  margin-right: 8px;
}

.file-item .file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-item .file-actions,
.file-item .folder-actions {
  display: flex;
  gap: 4px;
  opacity: 1 !important;
  padding: 0 !important;
  margin-left: 8px !important;
}

.file-item .action-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  padding: 4px 8px !important;
  background-color: #f8f9fa !important;
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  color: #666 !important;
  cursor: pointer !important;
  min-width: 64px !important;
  height: 28px !important;
  white-space: nowrap !important;
}

.file-item .action-button i {
  margin: 0 !important;
  font-size: 14px !important;
  width: 14px !important;
  text-align: center !important;
  color: inherit !important;
}

.file-item .action-button span {
  font-size: 12px !important;
  color: inherit !important;
  display: inline-block !important;
}

/* 文件管理操作按钮 */
.file-manager .file-actions .action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.file-manager .file-actions .action-button:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.file-manager .file-actions .action-button i {
  font-size: 16px;
}

.file-manager .file-actions .action-button span {
  font-size: 14px;
}

/* 编辑器容器 */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-left: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.format-buttons, .view-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

button {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  line-height: normal;
}

button i {
  font-size: 14px;
}

button span {
  font-size: 14px;
}

button:hover {
  background: #e9ecef;
  border-color: #ced4da;
}

.editor-content {
  flex: 1;
  overflow: auto;
  position: relative;
}

.editor-wrapper {
  flex: 1;
  position: relative;
}

.editor-wrapper.split-view {
  display: flex;
  gap: 20px;
}

.editor-wrapper.split-view .editor,
.editor-wrapper.split-view .preview {
  flex: 1;
  min-width: 0;
  max-width: 50%;
}

.editor {
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.editor:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
}

.preview {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background: #fff;
  border-left: 1px solid #ddd;
}

/* Markdown 样式 */
.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.preview :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: .3em;
}

.preview :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: .3em;
}

.preview :deep(h3) {
  font-size: 1.25em;
}

.preview :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.preview :deep(blockquote) {
  margin: 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: .25em solid #dfe2e5;
}

.preview :deep(code) {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,.05);
  border-radius: 3px;
  font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace;
}

.preview :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

.preview :deep(pre code) {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: 0;
}

.preview :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.preview :deep(td),
.preview :deep(th) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.preview :deep(tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.editor-content.live-preview {
  display: flex;
}

/* 移动端导航栏 */
.mobile-nav {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  z-index: 1001;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #ddd;
}

.menu-button {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #007bff;
  background: #fff;
  color: #007bff;
  font-size: 24px;
  padding: 0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.menu-button:active {
  background: #007bff;
  color: #fff;
  transform: scale(0.95);
}

.menu-button i {
  margin: 0;
}

.mobile-title {
  margin: 0;
  font-size: 18px;
  margin-left: 12px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 1999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
}

.overlay.show {
  opacity: 1;
  visibility: visible;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .markdown-editor {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .main-content {
    flex-direction: row;
    height: calc(100vh - 56px);
    position: relative;
  }

  /* 文件管理器 */
  .file-manager {
    position: fixed;
    top: 56px;
    left: 0;
    width: 80%;
    height: calc(100vh - 56px);
    background: #fff;
    z-index: 2000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  }

  .file-manager.show {
    transform: translateX(0);
  }

  /* 遮罩层 */
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    z-index: 1999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease;
  }

  .overlay.show {
    opacity: 1;
    visibility: visible;
  }

  /* 编辑器容器 */
  .editor-container {
    margin: 0;
    border: none;
    height: 100%;
    width: 100%;
    position: relative;
    background: #fff;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  /* 移动端导航栏 */
  .mobile-nav {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 56px;
    z-index: 1001;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  .menu-button {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #007bff;
    background: #fff;
    color: #007bff;
    font-size: 24px;
    padding: 0;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .menu-button:active {
    background: #007bff;
    color: #fff;
    transform: scale(0.95);
  }

  .menu-button i {
    margin: 0;
  }

  .mobile-title {
    margin: 0;
    font-size: 18px;
    margin-left: 12px;
    font-weight: 500;
    color: #333;
    flex: 1;
  }

  /* 根据视图状态显示内容 */
  .markdown-editor[data-view="editor"] .editor-container {
    display: flex;
  }

  .markdown-editor[data-view="files"] .file-manager {
    display: block;
  }

  /* 工具栏样式优化 */
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    padding: 8px;
    border-bottom: 1px solid #ddd;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    height: 56px;
    display: flex;
    align-items: center;
  }

  /* 编辑器内容区域 */
  .editor-content {
    height: calc(100vh - 112px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .editor,
  .preview {
    padding: 16px;
    font-size: 16px;
    line-height: 1.6;
  }

  /* 分屏预览模式优化 */
  .editor-wrapper.split-view {
    flex-direction: column;
  }

  .editor-wrapper.split-view .editor,
  .editor-wrapper.split-view .preview {
    max-width: 100%;
    width: 100%;
    height: 50%;
    min-height: calc((100vh - 112px) / 2);
  }
}

.path-navigator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  overflow-x: auto;
  white-space: nowrap;
}

.path-segment {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 14px;
}

.path-segment:hover {
  background: #e9ecef;
  border-radius: 4px;
}

.path-segment i {
  margin: 0 4px;
  font-size: 12px;
  color: #666;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  margin: 2px 0;
}

.file-item:hover {
  background: #f8f9fa;
}

.file-item.is-selected {
  background: #e9ecef;
}

.file-item i {
  width: 20px;
  text-align: center;
  margin-right: 8px;
}

.file-item .file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-item .file-actions,
.file-item .folder-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions,
.file-item:hover .folder-actions {
  opacity: 1;
}

.file-item .action-button {
  padding: 4px 8px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
}

.file-item .action-button:hover {
  background: #e9ecef;
  color: #333;
}
</style> 