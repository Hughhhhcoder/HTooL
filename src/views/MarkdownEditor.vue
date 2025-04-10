<template>
  <div class="markdown-editor">
    <!-- 移动端顶部导航栏 -->
    <div class="mobile-nav" v-if="isMobile">
      <button class="menu-button" @click="showFileManager = !showFileManager">
        <i class="fas fa-bars"></i>
      </button>
      <h2 class="mobile-title">Markdown 编辑器</h2>
    </div>

    <!-- 文件管理器 -->
    <div class="file-manager" :class="{ 'show': showFileManager }">
      <div class="file-header">
        <h3>文件管理</h3>
        <div class="file-actions">
          <button @click="createNewFile" class="action-button">
            <i class="fas fa-file"></i>
            <span>新建文件</span>
          </button>
          <button @click="createNewFolder" class="action-button">
            <i class="fas fa-folder"></i>
            <span>新建文件夹</span>
          </button>
          <button @click="uploadFile" class="action-button">
            <i class="fas fa-upload"></i>
            <span>上传文件</span>
          </button>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索文件..." 
          @input="filterFiles"
        >
        <i class="fas fa-search"></i>
      </div>

      <!-- 排序和过滤选项 -->
      <div class="filter-options">
        <select v-model="sortBy" @change="sortFiles">
          <option value="name">按名称</option>
          <option value="date">按日期</option>
          <option value="type">按类型</option>
        </select>
        <select v-model="filterType" @change="filterFiles">
          <option value="all">全部</option>
          <option value="file">仅文件</option>
          <option value="folder">仅文件夹</option>
        </select>
      </div>
      
      <div class="file-path">
        <span 
          v-for="(part, index) in currentPathParts" 
          :key="index"
          class="path-part"
          @click="navigateToPath(index)"
        >
          {{ part }}
          <span v-if="index < currentPathParts.length - 1" class="path-separator">/</span>
        </span>
      </div>

      <div 
        class="file-list"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div 
          v-for="item in filteredItems" 
          :key="item.path"
          class="file-item"
          :class="{ 
            'is-folder': item.isFolder, 
            'is-file': !item.isFolder,
            'selected': selectedItem === item
          }"
          @click="handleItemClick(item)"
          @contextmenu.prevent="showContextMenu($event, item)"
          draggable="true"
          @dragstart="handleDragStart($event, item)"
          @dragend="handleDragEnd"
        >
          <span class="item-icon">{{ item.isFolder ? '📁' : '📄' }}</span>
          <span class="item-name">{{ item.name }}</span>
          <div class="item-actions" v-if="!item.isFolder">
            <button @click.stop="editFile(item)" class="action-button">
              <i class="fas fa-edit"></i>
            </button>
            <button @click.stop="deleteItem(item)" class="action-button">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div 
      v-if="contextMenu.show" 
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click="contextMenu.show = false"
    >
      <div class="menu-item" @click="handleContextMenuAction('edit')">
        <i class="fas fa-edit"></i>
        <span>编辑</span>
      </div>
      <div class="menu-item" @click="handleContextMenuAction('rename')">
        <i class="fas fa-pencil-alt"></i>
        <span>重命名</span>
      </div>
      <div class="menu-item" @click="handleContextMenuAction('delete')">
        <i class="fas fa-trash"></i>
        <span>删除</span>
      </div>
      <div class="menu-item" @click="handleContextMenuAction('copy')">
        <i class="fas fa-copy"></i>
        <span>复制</span>
      </div>
      <div class="menu-item" @click="handleContextMenuAction('cut')">
        <i class="fas fa-cut"></i>
        <span>剪切</span>
      </div>
      <div class="menu-item" @click="handleContextMenuAction('paste')">
        <i class="fas fa-paste"></i>
        <span>粘贴</span>
      </div>
    </div>

    <!-- 编辑器容器 -->
    <div class="editor-container" :class="{ 'focus-mode': focusMode }">
      <div class="editor-header">
        <div class="editor-actions">
          <button @click="toggleFocusMode" class="action-button">
            <i :class="focusMode ? 'fas fa-compress' : 'fas fa-expand'"></i>
            <span>{{ focusMode ? '退出专注模式' : '专注模式' }}</span>
          </button>
          <button @click="toggleLivePreview" class="action-button">
            <i :class="isLivePreview ? 'fas fa-columns' : 'fas fa-columns'"></i>
            <span>{{ isLivePreview ? '关闭实时预览' : '实时预览' }}</span>
          </button>
          <button @click="togglePreviewMode" class="action-button">
            <i :class="isPreviewMode ? 'fas fa-edit' : 'fas fa-eye'"></i>
            <span>{{ isPreviewMode ? '编辑模式' : '预览模式' }}</span>
          </button>
          <button @click="saveFile" class="action-button">
            <i class="fas fa-save"></i>
            <span>保存</span>
          </button>
          <button @click="exportFile" class="action-button">
            <i class="fas fa-download"></i>
            <span>导出</span>
          </button>
        </div>
      </div>
      
      <div class="editor-content" :class="{ 'focus-mode': focusMode, 'live-preview': isLivePreview }">
        <div class="editor-wrapper" :class="{ 'split-view': isLivePreview }">
          <div 
            class="editor"
            contenteditable="true"
            @input="handleInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
            ref="editor"
            :placeholder="'开始编写 Markdown 文档...'"
          ></div>
          <div 
            v-if="isLivePreview"
            class="preview"
            ref="preview"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 响应式状态
const fileSystem = ref({
  root: {
    name: 'root',
    isFolder: true,
    children: {},
    path: '/'
  }
})

const currentPath = ref('/')
const content = ref('')
const editor = ref(null)
const preview = ref(null)
const focusMode = ref(false)
const showFileManager = ref(false)
const isMobile = ref(window.innerWidth <= 768)
const searchQuery = ref('')
const sortBy = ref('name')
const filterType = ref('all')
const selectedItem = ref(null)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  item: null
})
const clipboard = ref({
  type: null,
  item: null
})
const isPreviewMode = ref(false)
const isLivePreview = ref(false)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showFileManager.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  if (editor.value) {
    editor.value.textContent = content.value
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 计算当前路径的各个部分
const currentPathParts = computed(() => {
  return currentPath.value.split('/').filter(part => part)
})

// 计算当前文件夹的内容
const currentFolderItems = computed(() => {
  let current = fileSystem.value.root
  const pathParts = currentPath.value.split('/').filter(part => part)
  
  for (const part of pathParts) {
    if (current.children && current.children[part]) {
      current = current.children[part]
    } else {
      return [] // 如果路径不存在，返回空数组
    }
  }
  
  return Object.values(current.children || {})
})

// 计算过滤后的文件列表
const filteredItems = computed(() => {
  let items = currentFolderItems.value
  
  // 应用搜索过滤
  if (searchQuery.value) {
    items = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 应用类型过滤
  if (filterType.value !== 'all') {
    items = items.filter(item => 
      filterType.value === 'file' ? !item.isFolder : item.isFolder
    )
  }
  
  // 应用排序
  return [...items].sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    } else if (sortBy.value === 'date') {
      return (b.modified || 0) - (a.modified || 0)
    } else {
      return a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1
    }
  })
})

// 导航到指定路径
const navigateToPath = (index) => {
  const newPath = '/' + currentPathParts.value.slice(0, index + 1).join('/')
  currentPath.value = newPath
}

// 处理文件/文件夹点击
const handleItemClick = (item) => {
  if (item.isFolder) {
    currentPath.value = item.path
  } else {
    editFile(item)
  }
}

// 创建新文件
const createNewFile = () => {
  const fileName = prompt('请输入文件名（包含.md后缀）：')
  if (fileName && fileName.endsWith('.md')) {
    const newPath = currentPath.value + (currentPath.value.endsWith('/') ? '' : '/') + fileName
    const newFile = {
      name: fileName,
      isFolder: false,
      content: '',
      path: newPath
    }
    
    let current = fileSystem.value.root
    const pathParts = currentPath.value.split('/').filter(part => part)
    
    for (const part of pathParts) {
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          isFolder: true,
          children: {},
          path: current.path + part + '/'
        }
      }
      current = current.children[part]
    }
    
    current.children[fileName] = newFile
  }
}

// 创建新文件夹
const createNewFolder = async () => {
  const folderName = await prompt('请输入文件夹名称:')
  if (!folderName) return
  
  const current = getCurrentFolder()
  if (!current.children) {
    current.children = {}
  }
  
  current.children[folderName] = {
    name: folderName,
    isFolder: true,
    children: {},
    path: `${currentPath.value}/${folderName}`.replace(/\/+/g, '/')
  }
  
  updateCurrentFolder()
}

// 获取当前文件夹
const getCurrentFolder = () => {
  let current = fileSystem.value.root
  const pathParts = currentPath.value.split('/').filter(part => part)
  
  for (const part of pathParts) {
    if (!current.children) {
      current.children = {}
    }
    if (!current.children[part]) {
      current.children[part] = {
        name: part,
        isFolder: true,
        children: {},
        path: `${current.path}/${part}`.replace(/\/+/g, '/')
      }
    }
    current = current.children[part]
  }
  
  return current
}

// 更新当前文件夹
const updateCurrentFolder = () => {
  const current = getCurrentFolder()
  if (!current.children) {
    current.children = {}
  }
}

// 处理文件夹点击
const handleFolderClick = (folder) => {
  currentPath.value = folder.path
  updateCurrentFolder()
}

// 上传文件
const uploadFile = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileName = file.name
        const newPath = currentPath.value + (currentPath.value.endsWith('/') ? '' : '/') + fileName
        const newFile = {
          name: fileName,
          isFolder: false,
          content: e.target.result,
          path: newPath
        }
        
        let current = fileSystem.value.root
        const pathParts = currentPath.value.split('/').filter(part => part)
        
        for (const part of pathParts) {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              isFolder: true,
              children: {},
              path: current.path + part + '/'
            }
          }
          current = current.children[part]
        }
        
        current.children[fileName] = newFile
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 编辑文件
const editFile = (file) => {
  selectedItem.value = file
  content.value = file.content || ''
  isPreviewMode.value = false
  isLivePreview.value = false
  if (editor.value) {
    editor.value.textContent = content.value
  }
}

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 处理输入的防抖版本
const debouncedUpdatePreview = debounce((content) => {
  if (preview.value && (isLivePreview.value || isPreviewMode.value)) {
    const html = DOMPurify.sanitize(marked(content))
    preview.value.innerHTML = html
  }
}, 300)

// 处理输入
const handleInput = (e) => {
  const newContent = e.target.textContent
  content.value = newContent
  
  // 自动保存提示
  if (selectedItem.value) {
    selectedItem.value.content = newContent
    document.title = `${selectedItem.value.name} (未保存) - Markdown 编辑器`
  }
  
  debouncedUpdatePreview(newContent)
}

// 处理按键
const handleKeydown = (e) => {
  // Tab 键处理
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '    ')
    return
  }

  // 自动补全配对字符
  const pairs = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
    '*': '*',
    '_': '_',
    '`': '`'
  }

  if (pairs[e.key]) {
    e.preventDefault()
    const selection = window.getSelection()
    const range = selection.getRangeAt(0)
    const selectedText = range.toString()
    
    if (selectedText) {
      // 如果有选中的文本，将其包裹在配对字符中
      document.execCommand('insertText', false, e.key + selectedText + pairs[e.key])
    } else {
      // 如果没有选中文本，插入配对字符并将光标置于中间
      document.execCommand('insertText', false, e.key + pairs[e.key])
      range.setStart(range.startContainer, range.startOffset - 1)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    return
  }
  
  // 文件操作快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault()
        createNewFile()
        break
      case 'f':
        e.preventDefault()
        document.querySelector('.search-box input').focus()
        break
      case 's':
        e.preventDefault()
        saveFile()
        break
      case 'p':
        e.preventDefault()
        togglePreviewMode()
        break
      case 'l':
        e.preventDefault()
        toggleLivePreview()
        break
      case 'b':
        e.preventDefault()
        // 加粗
        wrapSelectedText('**')
        break
      case 'i':
        e.preventDefault()
        // 斜体
        wrapSelectedText('_')
        break
      case 'k':
        e.preventDefault()
        // 插入链接
        insertLink()
        break
    }
  }
}

// 包裹选中文本
const wrapSelectedText = (wrapper) => {
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  
  if (selectedText) {
    document.execCommand('insertText', false, `${wrapper}${selectedText}${wrapper}`)
  }
}

// 插入链接
const insertLink = () => {
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const selectedText = range.toString()
  
  const url = prompt('请输入链接地址:', 'https://')
  if (url) {
    const linkText = selectedText || '链接文本'
    document.execCommand('insertText', false, `[${linkText}](${url})`)
  }
}

// 处理粘贴
const handlePaste = (e) => {
  e.preventDefault()
  const text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// 更新预览
const updatePreview = () => {
  if (preview.value) {
    const html = DOMPurify.sanitize(marked(content.value))
    preview.value.innerHTML = html
  }
}

// 监听内容变化
watch(content, (newContent) => {
  if (isLivePreview.value && preview.value) {
    const html = DOMPurify.sanitize(marked(newContent))
    preview.value.innerHTML = html
  }
}, { immediate: true })

// 切换实时预览模式
const toggleLivePreview = () => {
  isLivePreview.value = !isLivePreview.value
  if (isLivePreview.value) {
    isPreviewMode.value = false
    editor.value.textContent = content.value
    debouncedUpdatePreview(content.value)
  }
}

// 切换预览模式
const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
  if (isPreviewMode.value) {
    isLivePreview.value = false
    const html = DOMPurify.sanitize(marked(content.value))
    editor.value.innerHTML = html
  } else {
    editor.value.textContent = content.value
  }
}

// 保存文件
const saveFile = () => {
  if (!selectedItem.value) {
    alert('请先选择或创建文件')
    return
  }

  const current = getCurrentFolder()
  if (current.children && current.children[selectedItem.value.name]) {
    current.children[selectedItem.value.name].content = content.value
    // 更新文件修改时间
    current.children[selectedItem.value.name].modified = Date.now()
    // 更新标题
    document.title = `${selectedItem.value.name} - Markdown 编辑器`
    // 显示保存成功提示
    const toast = document.createElement('div')
    toast.className = 'save-toast'
    toast.textContent = '文件已保存'
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 2000)
  } else {
    alert('保存失败：文件不存在')
  }
}

// 导出文件
const exportFile = () => {
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

// 删除文件/文件夹
const deleteItem = (item) => {
  if (confirm(`确定要删除 ${item.name} 吗？`)) {
    let current = fileSystem.value.root
    const pathParts = item.path.split('/').filter(part => part)
    const itemName = pathParts.pop()
    
    for (const part of pathParts) {
      current = current.children[part]
    }
    
    delete current.children[itemName]
  }
}

// 切换专注模式
const toggleFocusMode = () => {
  focusMode.value = !focusMode.value
}

// 显示右键菜单
const showContextMenu = (event, item) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    item
  }
  selectedItem.value = item
}

// 处理右键菜单操作
const handleContextMenuAction = (action) => {
  const item = contextMenu.value.item
  switch (action) {
    case 'edit':
      editFile(item)
      break
    case 'rename':
      renameItem(item)
      break
    case 'delete':
      deleteItem(item)
      break
    case 'copy':
      clipboard.value = { type: 'copy', item }
      break
    case 'cut':
      clipboard.value = { type: 'cut', item }
      break
    case 'paste':
      pasteItem(item)
      break
  }
  contextMenu.value.show = false
}

// 重命名项目
const renameItem = (item) => {
  const newName = prompt('请输入新名称：', item.name)
  if (newName && newName !== item.name) {
    let current = fileSystem.value.root
    const pathParts = item.path.split('/').filter(part => part)
    const oldName = pathParts.pop()
    
    for (const part of pathParts) {
      current = current.children[part]
    }
    
    const newItem = { ...item, name: newName }
    delete current.children[oldName]
    current.children[newName] = newItem
  }
}

// 粘贴项目
const pasteItem = (targetFolder) => {
  if (!clipboard.value.item || !targetFolder.isFolder) return
  
  const item = clipboard.value.item
  const newPath = targetFolder.path + item.name
  
  let current = fileSystem.value.root
  const pathParts = targetFolder.path.split('/').filter(part => part)
  
  for (const part of pathParts) {
    current = current.children[part]
  }
  
  current.children[item.name] = { ...item, path: newPath }
  
  if (clipboard.value.type === 'cut') {
    deleteItem(item)
  }
}

// 处理拖拽开始
const handleDragStart = (event, item) => {
  event.dataTransfer.setData('text/plain', JSON.stringify(item))
  selectedItem.value = item
}

// 处理拖拽结束
const handleDragEnd = () => {
  selectedItem.value = null
}

// 处理拖拽放置
const handleDrop = (event) => {
  event.preventDefault()
  const data = event.dataTransfer.getData('text/plain')
  try {
    const item = JSON.parse(data)
    if (item.path !== currentPath.value) {
      const sourceFolder = getParentFolder(item.path)
      const targetFolder = getCurrentFolder()
      
      // 移动项目
      if (!targetFolder.children) {
        targetFolder.children = {}
      }
      targetFolder.children[item.name] = item
      delete sourceFolder.children[item.name]
      
      // 更新路径
      if (item.isFolder) {
        updateFolderPath(item, `${currentPath.value}/${item.name}`.replace(/\/+/g, '/'))
      } else {
        item.path = `${currentPath.value}/${item.name}`.replace(/\/+/g, '/')
      }
      
      updateCurrentFolder()
    }
  } catch (e) {
    console.error('拖放处理错误:', e)
  }
}

// 更新文件夹路径
const updateFolderPath = (folder, newPath) => {
  folder.path = newPath
  if (folder.children) {
    Object.values(folder.children).forEach(child => {
      const childPath = `${newPath}/${child.name}`.replace(/\/+/g, '/')
      if (child.isFolder) {
        updateFolderPath(child, childPath)
      } else {
        child.path = childPath
      }
    })
  }
}

// 获取父文件夹
const getParentFolder = (path) => {
  const parts = path.split('/').filter(part => part)
  parts.pop()
  let current = fileSystem.value.root
  
  for (const part of parts) {
    if (!current.children || !current.children[part]) {
      return current
    }
    current = current.children[part]
  }
  
  return current
}

// 过滤文件
const filterFiles = () => {
  // Implementation of filterFiles function
}

// 排序文件
const sortFiles = () => {
  // Implementation of sortFiles function
}
</script>

<style scoped>
.markdown-editor {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  height: 100vh;
  padding: 20px;
  background: #f8f9fa;
  position: relative;
}

/* 移动端导航栏 */
.mobile-nav {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  z-index: 1000;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  align-items: center;
}

.menu-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  cursor: pointer;
  padding: 10px;
}

.mobile-title {
  margin: 0;
  font-size: 18px;
  color: #333;
}

/* 文件管理器 */
.file-manager {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.file-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.file-path {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.path-part {
  cursor: pointer;
  color: #007bff;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.path-part:hover {
  background: rgba(0, 123, 255, 0.1);
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.file-item {
  position: relative;
  padding: 12px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s;
}

.file-item:hover {
  background: var(--hover-color);
  transform: translateX(4px);
}

.item-icon {
  margin-right: 12px;
  font-size: 1.2em;
}

.item-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.item-actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .item-actions {
  opacity: 1;
}

/* 编辑器容器 */
.editor-container {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.editor-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.editor-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 30px;
}

.editor {
  min-height: 100%;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 20px;
  border-radius: 8px;
  background: var(--bg-color);
  transition: background-color 0.3s;
}

.editor:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
}

.editor:focus {
  outline: none;
  background: var(--bg-color-focus);
}

/* 确保编辑器和预览内容样式一致 */
.editor :deep(p),
.editor :deep(h1),
.editor :deep(h2),
.editor :deep(h3),
.editor :deep(h4),
.editor :deep(h5),
.editor :deep(h6),
.editor :deep(ul),
.editor :deep(ol),
.editor :deep(blockquote),
.editor :deep(pre),
.editor :deep(code),
.editor :deep(table) {
  margin: 1em 0;
  line-height: 1.8;
}

/* Markdown 样式 */
.editor :deep(h1) {
  font-size: 2.5em;
  margin: 1em 0 0.5em;
  font-weight: 600;
  color: #2c3e50;
}

.editor :deep(h2) {
  font-size: 2em;
  margin: 1em 0 0.5em;
  font-weight: 600;
  color: #2c3e50;
}

.editor :deep(h3) {
  font-size: 1.5em;
  margin: 1em 0 0.5em;
  font-weight: 600;
  color: #2c3e50;
}

.editor :deep(p) {
  margin: 1em 0;
  line-height: 1.8;
}

.editor :deep(ul), .editor :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.editor :deep(blockquote) {
  margin: 1em 0;
  padding: 1em 1.5em;
  border-left: 4px solid #007bff;
  background: #f8f9fa;
  color: #666;
  border-radius: 0 8px 8px 0;
}

.editor :deep(code) {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 85%;
  color: #e83e8c;
}

.editor :deep(pre) {
  background: #f6f8fa;
  padding: 1em;
  border-radius: 8px;
  overflow: auto;
  margin: 1em 0;
}

.editor :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  color: #333;
}

.editor :deep(table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.editor :deep(th), .editor :deep(td) {
  border: 1px solid #dee2e6;
  padding: 12px;
}

.editor :deep(th) {
  background: #f8f9fa;
  font-weight: 600;
}

.editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

/* 按钮样式 */
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.action-button i {
  font-size: 14px;
}

/* 专注模式 */
.editor-container.focus-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  border-radius: 0;
}

.editor-content.focus-mode {
  max-width: 800px;
  margin: 0 auto;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .markdown-editor {
    grid-template-columns: 1fr;
    padding: 0;
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
  }

  .mobile-nav {
    display: none; /* 移除移动端导航，因为现在使用全局导航 */
  }

  .file-manager {
    position: fixed;
    top: 60px; /* 从顶部导航栏下方开始 */
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 999;
    transform: translateX(-100%);
    border-radius: 0;
    transition: transform 0.3s ease;
    background: var(--bg-color);
    padding: 15px;
  }

  .file-manager.show {
    transform: translateX(0);
  }

  .editor-container {
    border-radius: 0;
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
  }

  .editor-header {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .editor-actions {
    display: flex;
    gap: 8px;
  }

  .action-button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .action-button span {
    display: inline;
    font-size: 12px;
  }

  .editor-wrapper {
    padding: 15px;
    height: calc(100% - 50px);
    overflow-y: auto;
  }

  .editor {
    font-size: 16px;
    line-height: 1.6;
    min-height: 100%;
  }

  /* 文件管理器移动端优化 */
  .file-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .file-actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .file-actions .action-button {
    width: 100%;
    justify-content: center;
    padding: 8px;
  }

  .file-actions .action-button span {
    display: inline;
    font-size: 12px;
  }

  .search-box {
    margin: 10px 0;
  }

  .filter-options {
    flex-direction: column;
    gap: 8px;
  }

  .filter-options select {
    width: 100%;
  }

  .file-path {
    padding: 8px;
    font-size: 12px;
  }

  .file-item {
    padding: 10px;
  }

  .item-actions {
    opacity: 1;
  }

  /* 专注模式移动端适配 */
  .editor-container.focus-mode {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    margin: 0;
  }

  .editor-content.focus-mode {
    max-width: 100%;
    padding: 0;
  }

  .editor-wrapper.focus-mode {
    padding: 15px;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .markdown-editor {
    background: #1a1a1a;
  }

  .file-manager,
  .editor-container {
    background: #2d2d2d;
  }

  .file-path {
    background: #333;
  }

  .file-item {
    background: #333;
  }

  .editor {
    color: #e0e0e0;
  }

  .editor :deep(h1),
  .editor :deep(h2),
  .editor :deep(h3) {
    color: #fff;
  }

  .editor :deep(blockquote) {
    background: #333;
    color: #ccc;
  }

  .editor :deep(code) {
    background: #333;
    color: #ff79c6;
  }

  .editor :deep(pre) {
    background: #333;
  }

  .editor :deep(pre code) {
    color: #e0e0e0;
  }

  .editor :deep(th) {
    background: #333;
  }

  .mobile-nav {
    background: #2d2d2d;
  }

  .menu-button,
  .mobile-title {
    color: #fff;
  }
}

/* 搜索框样式 */
.search-box {
  position: relative;
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  padding-left: 35px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #007bff;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

/* 过滤选项样式 */
.filter-options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-options select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: white;
  cursor: pointer;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item i {
  width: 16px;
  color: #6c757d;
}

/* 选中项样式 */
.file-item.selected {
  background: var(--selected-color);
  border-left: 3px solid var(--primary-color);
}

/* 拖拽提示样式 */
.file-item.dragging {
  opacity: 0.5;
}

.file-list.drag-over {
  background: rgba(0, 123, 255, 0.1);
}

/* 暗色模式支持 */
.dark-theme .editor-container {
  background: #2d2d2d;
  border-color: #444;
}

.dark-theme .file-manager {
  background: #333;
  border-color: #444;
}

.dark-theme .file-path {
  background: #333;
  border-color: #444;
}

.dark-theme .file-path span {
  color: #ccc;
}

.dark-theme .file-path span:hover {
  color: var(--primary-color);
}

.dark-theme .file-list {
  border-color: #444;
}

.dark-theme .file-item {
  border-color: #444;
}

.dark-theme .file-item:hover {
  background: #3a3a3a;
}

.dark-theme .file-item .file-name {
  color: #ddd;
}

.dark-theme .file-item .file-actions {
  color: #aaa;
}

.dark-theme .file-item:hover .file-actions {
  color: #fff;
}

.dark-theme .editor-toolbar {
  background: #333;
  border-color: #444;
}

.dark-theme .editor-toolbar button {
  color: #ddd;
  border-color: #444;
}

.dark-theme .editor-toolbar button:hover {
  background: #3a3a3a;
  color: #fff;
}

.dark-theme .editor-content {
  background: #2d2d2d;
  color: #ddd;
}

.dark-theme .editor-content:focus {
  outline: none;
}

.dark-theme .editor-content::placeholder {
  color: #666;
}

.dark-theme .editor-content h1,
.dark-theme .editor-content h2,
.dark-theme .editor-content h3,
.dark-theme .editor-content h4,
.dark-theme .editor-content h5,
.dark-theme .editor-content h6 {
  color: #fff;
  border-color: #444;
}

.dark-theme .editor-content p {
  color: #ddd;
}

.dark-theme .editor-content code {
  background: #3a3a3a;
  color: #fff;
}

.dark-theme .editor-content pre {
  background: #3a3a3a;
  border-color: #444;
}

.dark-theme .editor-content blockquote {
  border-color: #444;
  color: #aaa;
}

.dark-theme .editor-content table {
  border-color: #444;
}

.dark-theme .editor-content th,
.dark-theme .editor-content td {
  border-color: #444;
}

.dark-theme .editor-content th {
  background: #3a3a3a;
}

.dark-theme .editor-content tr:nth-child(even) {
  background: #333;
}

.dark-theme .editor-content img {
  border-color: #444;
}

.dark-theme .mobile-nav {
  background: #333;
  border-color: #444;
}

.dark-theme .mobile-nav button {
  color: #ddd;
}

.dark-theme .mobile-nav button:hover {
  color: #fff;
}

/* 暗色模式下的代码块语法高亮 */
.dark-theme .editor-content pre code {
  color: #ddd;
}

.dark-theme .editor-content pre code .keyword {
  color: #569cd6;
}

.dark-theme .editor-content pre code .string {
  color: #ce9178;
}

.dark-theme .editor-content pre code .comment {
  color: #6a9955;
}

.dark-theme .editor-content pre code .number {
  color: #b5cea8;
}

.dark-theme .editor-content pre code .function {
  color: #dcdcaa;
}

/* 暗色模式下的链接样式 */
.dark-theme .editor-content a {
  color: #569cd6;
}

.dark-theme .editor-content a:hover {
  color: #4ec9b0;
}

/* 暗色模式下的列表样式 */
.dark-theme .editor-content ul,
.dark-theme .editor-content ol {
  color: #ddd;
}

.dark-theme .editor-content li::marker {
  color: #666;
}

/* 暗色模式下的水平线样式 */
.dark-theme .editor-content hr {
  border-color: #444;
}

/* 暗色模式下的表格样式 */
.dark-theme .editor-content table {
  background: #333;
}

.dark-theme .editor-content th {
  color: #fff;
}

.dark-theme .editor-content td {
  color: #ddd;
}

/* 暗色模式下的引用块样式 */
.dark-theme .editor-content blockquote {
  background: #333;
}

/* 暗色模式下的图片样式 */
.dark-theme .editor-content img {
  background: #333;
}

/* 暗色模式下的内联代码样式 */
.dark-theme .editor-content code {
  background: #3a3a3a;
  color: #fff;
}

/* 暗色模式下的任务列表样式 */
.dark-theme .editor-content input[type="checkbox"] {
  border-color: #666;
  background: #333;
}

.dark-theme .editor-content input[type="checkbox"]:checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

/* 实时预览模式样式 */
.editor-wrapper.split-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 100%;
}

.preview {
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.preview:hover {
  border-color: var(--primary-color);
}

.preview :deep(p),
.preview :deep(h1),
.preview :deep(h2),
.preview :deep(h3),
.preview :deep(h4),
.preview :deep(h5),
.preview :deep(h6),
.preview :deep(ul),
.preview :deep(ol),
.preview :deep(blockquote),
.preview :deep(pre),
.preview :deep(code),
.preview :deep(table) {
  margin: 1em 0;
  line-height: 1.8;
}

/* 暗色模式下的实时预览 */
.dark-theme .preview {
  background: #2d2d2d;
  border-color: #444;
}

/* 移动端实时预览适配 */
@media (max-width: 768px) {
  .editor-wrapper.split-view {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .preview {
    padding: 15px;
  }
}

/* 保存提示样式 */
.save-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

/* 编辑器优化样式 */
.editor {
  padding: 20px;
  border-radius: 8px;
  background: var(--bg-color);
  transition: background-color 0.3s;
}

.editor:focus {
  background: var(--bg-color-focus);
}

/* 预览区域优化 */
.preview {
  padding: 20px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s;
}

.preview:hover {
  border-color: var(--primary-color);
}

/* 文件管理器交互优化 */
.file-item {
  position: relative;
  padding: 12px;
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s;
}

.file-item:hover {
  background: var(--hover-color);
  transform: translateX(4px);
}

.file-item.selected {
  background: var(--selected-color);
  border-left: 3px solid var(--primary-color);
}

.file-item .item-actions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .item-actions {
  opacity: 1;
}

/* 移动端适配优化 */
@media (max-width: 768px) {
  .editor-wrapper.split-view {
    display: flex;
    flex-direction: column;
  }

  .preview {
    margin-top: 20px;
    max-height: 50vh;
  }

  .file-item .item-actions {
    opacity: 1;
    position: relative;
    transform: none;
    top: auto;
    right: auto;
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
}
</style> 