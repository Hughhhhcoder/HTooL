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
      
      <div class="editor-content" :class="{ 'focus-mode': focusMode }">
        <div class="editor-wrapper">
          <div 
            class="editor"
            contenteditable="true"
            @input="handleInput"
            @keydown="handleKeydown"
            @paste="handlePaste"
            ref="editor"
            :placeholder="'开始编写 Markdown 文档...'"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
    editor.value.innerHTML = content.value
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
    if (current.children[part]) {
      current = current.children[part]
    }
  }
  
  return Object.values(current.children)
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
const createNewFolder = () => {
  const folderName = prompt('请输入文件夹名：')
  if (folderName) {
    const newPath = currentPath.value + (currentPath.value.endsWith('/') ? '' : '/') + folderName + '/'
    const newFolder = {
      name: folderName,
      isFolder: true,
      children: {},
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
    
    current.children[folderName] = newFolder
  }
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
  content.value = file.content || ''
  if (editor.value) {
    editor.value.innerHTML = content.value
  }
}

// 保存文件
const saveFile = () => {
  const fileName = prompt('请输入文件名（包含.md后缀）：')
  if (fileName && fileName.endsWith('.md')) {
    const newPath = currentPath.value + (currentPath.value.endsWith('/') ? '' : '/') + fileName
    const newFile = {
      name: fileName,
      isFolder: false,
      content: content.value,
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

// 处理输入
const handleInput = (e) => {
  content.value = e.target.innerHTML
  updatePreview()
}

// 处理按键
const handleKeydown = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    document.execCommand('insertText', false, '    ')
  }
  
  // 文件操作快捷键
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
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
    }
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
  if (editor.value) {
    const html = DOMPurify.sanitize(marked(content.value))
    editor.value.innerHTML = html
  }
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
  event.dataTransfer.setData('text/plain', item.path)
  selectedItem.value = item
}

// 处理拖拽结束
const handleDragEnd = () => {
  selectedItem.value = null
}

// 处理拖拽放置
const handleDrop = (event) => {
  const path = event.dataTransfer.getData('text/plain')
  const item = findItemByPath(path)
  if (item) {
    const targetFolder = findItemByPath(currentPath.value)
    if (targetFolder && targetFolder.isFolder) {
      pasteItem(targetFolder)
    }
  }
}

// 查找项目
const findItemByPath = (path) => {
  let current = fileSystem.value.root
  const pathParts = path.split('/').filter(part => part)
  
  for (const part of pathParts) {
    if (!current.children[part]) return null
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
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  background: #e9ecef;
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
  display: flex;
  gap: 8px;
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
}

.editor:empty:before {
  content: attr(placeholder);
  color: #999;
  pointer-events: none;
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
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .mobile-nav {
    display: flex;
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

  .file-manager {
    position: fixed;
    top: 60px;
    left: 0;
    bottom: 0;
    width: 100%;
    z-index: 999;
    transform: translateX(-100%);
    border-radius: 0;
    transition: transform 0.3s ease;
    background: white;
    padding: 15px;
  }

  .file-manager.show {
    transform: translateX(0);
  }

  .editor-container {
    border-radius: 0;
    margin-top: 60px;
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

  /* 暗色模式移动端适配 */
  @media (prefers-color-scheme: dark) {
    .mobile-nav {
      background: #2d2d2d;
    }

    .file-manager {
      background: #2d2d2d;
    }

    .editor-container {
      background: #2d2d2d;
    }

    .action-button {
      background: #444;
    }

    .action-button:hover {
      background: #555;
    }
  }
}

/* 专注模式移动端适配 */
@media (max-width: 768px) {
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
  background: #e9ecef;
  border-left: 3px solid #007bff;
}

/* 拖拽提示样式 */
.file-item.dragging {
  opacity: 0.5;
}

.file-list.drag-over {
  background: rgba(0, 123, 255, 0.1);
}
</style> 