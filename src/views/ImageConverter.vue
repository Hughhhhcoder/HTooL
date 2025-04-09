<template>
  <div class="image-converter">
    <div class="converter-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
      <h2>图片格式转换</h2>
    </div>

    <div class="converter-content">
      <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          type="file" 
          ref="fileInput"
          accept="image/*"
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-placeholder" v-if="!selectedFile">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>点击或拖拽图片到这里</p>
          <p class="hint">支持 JPG、PNG、GIF、WebP、TIFF、BMP、SVG 等格式</p>
        </div>
        <div class="file-preview" v-else>
          <img :src="previewUrl" alt="预览图" />
          <div class="file-info">
            <p>文件名: {{ selectedFile.name }}</p>
            <p>大小: {{ formatFileSize(selectedFile.size) }}</p>
          </div>
        </div>
      </div>

      <div class="conversion-options" v-if="selectedFile">
        <div class="option-group">
          <label>目标格式:</label>
          <select v-model="targetFormat">
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="gif">GIF</option>
            <option value="bmp">BMP</option>
          </select>
        </div>

        <div class="option-group" v-if="targetFormat === 'jpeg' || targetFormat === 'webp'">
          <label>质量:</label>
          <input 
            type="range" 
            v-model="quality" 
            min="1" 
            max="100" 
            step="1"
          />
          <span>{{ quality }}%</span>
        </div>

        <div class="option-group">
          <label>调整大小:</label>
          <div class="resize-options">
            <input 
              type="number" 
              v-model="width" 
              placeholder="宽度"
              :disabled="maintainAspectRatio"
            />
            <span>×</span>
            <input 
              type="number" 
              v-model="height" 
              placeholder="高度"
              :disabled="maintainAspectRatio"
            />
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="maintainAspectRatio"
              />
              保持宽高比
            </label>
          </div>
        </div>

        <button 
          class="convert-btn" 
          @click="convertImage"
          :disabled="isConverting"
        >
          {{ isConverting ? '转换中...' : '开始转换' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
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

const convertImage = async () => {
  if (!selectedFile.value) return
  
  isConverting.value = true
  try {
    // 创建图片元素
    const img = new Image()
    img.src = previewUrl.value
    
    // 等待图片加载完成
    await new Promise((resolve) => {
      img.onload = resolve
    })
    
    // 创建 canvas 元素
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 计算目标尺寸
    let targetWidth = img.width
    let targetHeight = img.height
    
    if (width.value || height.value) {
      if (maintainAspectRatio.value) {
        const aspectRatio = img.width / img.height
        if (width.value) {
          targetWidth = parseInt(width.value)
          targetHeight = Math.round(targetWidth / aspectRatio)
        } else {
          targetHeight = parseInt(height.value)
          targetWidth = Math.round(targetHeight * aspectRatio)
        }
      } else {
        targetWidth = width.value ? parseInt(width.value) : targetWidth
        targetHeight = height.value ? parseInt(height.value) : targetHeight
      }
    }
    
    // 设置 canvas 尺寸
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    // 绘制图片
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    
    // 转换为目标格式
    let mimeType = 'image/jpeg'
    let qualityValue = quality.value / 100
    
    switch (targetFormat.value) {
      case 'png':
        mimeType = 'image/png'
        break
      case 'webp':
        mimeType = 'image/webp'
        break
      case 'gif':
        mimeType = 'image/gif'
        break
      case 'bmp':
        mimeType = 'image/bmp'
        break
    }
    
    // 转换为 Blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, mimeType, qualityValue)
    })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedFile.value.name.split('.')[0]}.${targetFormat.value}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('转换失败:', error)
    alert('图片转换失败，请重试')
  } finally {
    isConverting.value = false
  }
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

.upload-area {
  flex: 1;
  background-color: white;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #007bff;
}

.upload-placeholder {
  text-align: center;
  color: #666;
}

.upload-placeholder i {
  font-size: 48px;
  margin-bottom: 10px;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.file-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.file-info {
  margin-top: 10px;
  text-align: center;
  color: #666;
}

.conversion-options {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-group label {
  min-width: 80px;
  color: #666;
}

select, input[type="number"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}

input[type="range"] {
  flex: 1;
}

.resize-options {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.resize-options input {
  width: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
}

.convert-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}

.convert-btn:hover {
  background-color: #0056b3;
}

.convert-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .converter-content {
    padding: 10px;
  }
  
  .option-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .resize-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .checkbox-label {
    margin-left: 0;
  }
}
</style> 