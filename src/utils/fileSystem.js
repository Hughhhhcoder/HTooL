import { ref } from 'vue'
import { ipcRenderer } from 'electron'

// 文件系统状态
const fileSystem = ref({
  root: {
    name: 'root',
    isFolder: true,
    children: {},
    path: '/'
  }
})

// 当前选中的文件
const currentFile = ref(null)

// 文件历史记录
const fileHistory = ref([])

// 浏览本地文件夹
const browseLocalFolder = async () => {
  try {
    const result = await ipcRenderer.invoke('browse-folder')
    if (result) {
      await loadFolder(result)
    }
  } catch (error) {
    console.error('浏览文件夹失败:', error)
  }
}

// 导入文件夹
const importFolder = async (path) => {
  try {
    const result = await ipcRenderer.invoke('import-folder', path)
    if (result) {
      await loadFolder(result)
    }
  } catch (error) {
    console.error('导入文件夹失败:', error)
  }
}

// 加载文件夹内容
const loadFolder = async (path) => {
  try {
    const files = await ipcRenderer.invoke('read-folder', path)
    updateFileSystem(path, files)
  } catch (error) {
    console.error('加载文件夹失败:', error)
  }
}

// 更新文件系统
const updateFileSystem = (path, files) => {
  let current = fileSystem.value.root
  const pathParts = path.split('/').filter(part => part)
  
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
  
  current.children = files.reduce((acc, file) => {
    acc[file.name] = {
      name: file.name,
      isFolder: file.isFolder,
      path: `${current.path}/${file.name}`.replace(/\/+/g, '/'),
      content: file.content || '',
      modified: file.modified || Date.now()
    }
    return acc
  }, {})
}

// 创建新文件
const createNewFile = async (path, name) => {
  try {
    const result = await ipcRenderer.invoke('create-file', { path, name })
    if (result) {
      await loadFolder(path)
    }
  } catch (error) {
    console.error('创建文件失败:', error)
  }
}

// 保存文件
const saveFile = async (file) => {
  try {
    const result = await ipcRenderer.invoke('save-file', file)
    if (result) {
      // 更新文件系统
      const parentPath = file.path.split('/').slice(0, -1).join('/')
      await loadFolder(parentPath)
    }
  } catch (error) {
    console.error('保存文件失败:', error)
  }
}

// 删除文件
const deleteFile = async (path) => {
  try {
    const result = await ipcRenderer.invoke('delete-file', path)
    if (result) {
      const parentPath = path.split('/').slice(0, -1).join('/')
      await loadFolder(parentPath)
    }
  } catch (error) {
    console.error('删除文件失败:', error)
  }
}

// 重命名文件
const renameFile = async (oldPath, newName) => {
  try {
    const result = await ipcRenderer.invoke('rename-file', { oldPath, newName })
    if (result) {
      const parentPath = oldPath.split('/').slice(0, -1).join('/')
      await loadFolder(parentPath)
    }
  } catch (error) {
    console.error('重命名文件失败:', error)
  }
}

// 获取文件历史
const getFileHistory = (path) => {
  return fileHistory.value.filter(record => record.path === path)
}

// 回退到历史版本
const revertToHistory = async (path, timestamp) => {
  const history = getFileHistory(path)
  const version = history.find(record => record.timestamp === timestamp)
  if (version) {
    await saveFile({
      path,
      content: version.content
    })
  }
}

export {
  fileSystem,
  currentFile,
  fileHistory,
  browseLocalFolder,
  importFolder,
  loadFolder,
  createNewFile,
  saveFile,
  deleteFile,
  renameFile,
  getFileHistory,
  revertToHistory
} 