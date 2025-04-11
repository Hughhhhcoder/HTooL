<template>
  <div class="image-converter">
    <div class="converter-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <h2>图片格式转换</h2>
      <div class="converter-actions">
        <button class="btn" @click="selectFiles" :disabled="isConverting">
          <i class="fas fa-folder-open"></i> 选择文件
        </button>
        <button class="btn" @click="clearFiles" :disabled="!files.length || isConverting">
          <i class="fas fa-trash"></i> 清空
        </button>
        <button class="btn" @click="convertAll" :disabled="!files.length || isConverting">
          <i class="fas fa-exchange-alt"></i> 转换全部
        </button>
        <button class="btn" @click="downloadAll" :disabled="!convertedFiles.length">
          <i class="fas fa-download"></i> 下载全部
        </button>
      </div>
    </div>

    <div class="converter-content">
      <div class="file-list" v-if="files.length">
        <div class="file-item" v-for="(file, index) in files" :key="index">
          <div class="file-info">
            <i class="fas" :class="getFileIcon(file.type)"></i>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="file-actions">
            <select v-model="file.targetFormat" :disabled="isConverting">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
              <option value="gif">GIF</option>
            </select>
            <button class="btn" @click="convertFile(file)" :disabled="isConverting">
              <i class="fas fa-exchange-alt"></i> 转换
            </button>
            <button class="btn" @click="removeFile(index)" :disabled="isConverting">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="conversion-progress" v-if="file.converting">
            <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
            <span class="progress-text">{{ file.progress }}%</span>
          </div>
        </div>
      </div>

      <div class="drop-zone" v-else @dragover.prevent @drop.prevent="handleDrop">
        <i class="fas fa-cloud-upload-alt"></i>
        <p>拖放图片到这里或点击选择文件</p>
        <p class="hint">支持 PNG、JPG、WebP、GIF 格式</p>
      </div>

      <div class="converted-files" v-if="convertedFiles.length">
        <h3>已转换文件</h3>
        <div class="file-list">
          <div class="file-item" v-for="(file, index) in convertedFiles" :key="index">
            <div class="file-info">
              <i class="fas" :class="getFileIcon(file.type)"></i>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
            <div class="file-actions">
              <button class="btn" @click="downloadFile(file)">
                <i class="fas fa-download"></i> 下载
              </button>
              <button class="btn" @click="removeConvertedFile(index)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const targetFormat = ref('jpeg')
const quality = ref(80)
const width = ref('')
const height = ref('')
const maintainAspectRatio = ref(true)
const isConverting = ref(false)
const files = ref([])
const convertedFiles = ref([])

const goBack = () => {
  router.push('/')
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (e) => {
  const newFiles = Array.from(e.dataTransfer.files)
  newFiles.forEach(file => {
    if (file.type.startsWith('image/')) {
      file.targetFormat = 'png'
      file.converting = false
      file.progress = 0
      files.value.push(file)
    }
  })
}

const processFile = (file) => {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 监听宽高变化，保持宽高比
watch([width, height, maintainAspectRatio], ([newWidth, newHeight, maintain]) => {
  if (!maintain || !selectedFile.value) return
  
  const img = new Image()
  img.onload = () => {
    const aspectRatio = img.width / img.height
    
    if (newWidth && !newHeight) {
      height.value = Math.round(newWidth / aspectRatio)
    } else if (!newWidth && newHeight) {
      width.value = Math.round(newHeight * aspectRatio)
    }
  }
  img.src = previewUrl.value
})

const convertImage = (file, targetFormat) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('无效的文件类型'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('转换失败'))
            return
          }
          const newFile = new File([blob], `${file.name.split('.')[0]}.${targetFormat}`, {
            type: `image/${targetFormat}`
          })
          resolve(newFile)
        }, `image/${targetFormat}`)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

// 获取文件图标
const getFileIcon = (type) => {
  if (!type) return 'fa-file'
  const icons = {
    'image/png': 'fa-file-image',
    'image/jpeg': 'fa-file-image',
    'image/jpg': 'fa-file-image',
    'image/webp': 'fa-file-image',
    'image/gif': 'fa-file-image'
  }
  return icons[type.toLowerCase()] || 'fa-file'
}

// 选择文件
const selectFiles = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*'
  input.onchange = (e) => {
    const newFiles = Array.from(e.target.files)
    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        file.targetFormat = 'png'
        file.converting = false
        file.progress = 0
        files.value.push(file)
      }
    })
  }
  input.click()
}

// 移除文件
const removeFile = (index) => {
  files.value.splice(index, 1)
}

// 移除已转换文件
const removeConvertedFile = (index) => {
  convertedFiles.value.splice(index, 1)
}

// 清空文件
const clearFiles = () => {
  files.value = []
  convertedFiles.value = []
}

// 转换单个文件
const convertFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    console.error('无效的文件类型')
    return
  }

  file.converting = true
  file.progress = 0
  
  try {
    const result = await convertImage(file, file.targetFormat)
    if (result) {
      convertedFiles.value.push(result)
      file.progress = 100
    }
  } catch (error) {
    console.error('转换失败:', error)
  } finally {
    file.converting = false
  }
}

// 转换所有文件
const convertAll = async () => {
  isConverting.value = true
  const totalFiles = files.value.length
  let completedFiles = 0

  for (const file of files.value) {
    if (!file.converting) {
      file.converting = true
      file.progress = 0
      
      try {
        const result = await convertImage(file, file.targetFormat)
        convertedFiles.value.push(result)
        file.progress = 100
      } catch (error) {
        console.error('转换失败:', error)
      } finally {
        file.converting = false
        completedFiles++
      }
    }
  }

  isConverting.value = false
}

// 下载单个文件
const downloadFile = (file) => {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 下载所有文件
const downloadAll = () => {
  convertedFiles.value.forEach(file => {
    downloadFile(file)
  })
}
</script>

<style scoped>
.image-converter {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.converter-header {
  padding: 10px;
  background-color: white;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 10px;
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

.converter-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s;
}

.file-item:hover {
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.file-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.conversion-progress {
  margin-top: 10px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 0.8em;
  color: var(--text-secondary);
}

.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  cursor: pointer;
  transition: all 0.3s;
}

.drop-zone:hover {
  border-color: var(--primary-color);
  background: var(--hover-color);
}

.drop-zone i {
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.hint {
  color: var(--text-secondary);
  font-size: 0.9em;
  margin-top: 10px;
}

.converted-files {
  margin-top: 30px;
}

.converted-files h3 {
  margin-bottom: 15px;
  color: var(--text-primary);
}

/* 暗色模式适配 */
.dark-theme .file-item {
  background: var(--bg-color);
  border-color: var(--border-color);
}

.dark-theme .drop-zone {
  background: var(--bg-color);
  border-color: var(--border-color);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .converter-header {
    flex-direction: column;
    gap: 15px;
  }

  .converter-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .file-actions {
    flex-wrap: wrap;
  }

  .file-info {
    flex-wrap: wrap;
  }
}
</style> 