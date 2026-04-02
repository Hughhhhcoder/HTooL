<template>
  <section class="page image-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">Image & Encoding</p>
        <h1 class="page-title">图片格式转换</h1>
        <p class="page-subtitle">支持批量转换、质量调节与分批下载，适配常见图片格式。</p>
      </div>

      <div class="header-actions">
        <button class="btn" @click="goBack">返回画廊</button>
        <button class="btn" @click="selectFiles" :disabled="isConverting">选择文件</button>
        <button class="btn" @click="clearFiles" :disabled="!files.length || isConverting">清空</button>
        <button class="btn btn-primary" @click="convertAll" :disabled="!files.length || isConverting">
          转换全部
        </button>
        <button class="btn btn-primary" @click="downloadAll" :disabled="!convertedFiles.length">
          下载全部
        </button>
      </div>
    </header>

    <section class="panel control-panel" v-if="files.length">
      <h2 class="section-title">批量设置</h2>
      <div class="batch-row">
        <label>
          输出格式
          <select v-model="batchFormat" @change="applyBatchFormat" :disabled="isConverting">
            <option value="">选择格式...</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
            <option value="gif">GIF</option>
          </select>
        </label>

        <label v-if="batchFormat && batchFormat !== 'gif'">
          质量 {{ batchQuality }}%
          <input
            type="range"
            v-model.number="batchQuality"
            min="1"
            max="100"
            @change="applyBatchQuality"
            :disabled="isConverting"
          />
        </label>
      </div>
    </section>

    <section class="panel files-panel" v-if="files.length">
      <h2 class="section-title">待转换文件</h2>

      <div class="file-list">
        <article class="file-item" v-for="(file, index) in files" :key="index">
          <div class="file-head">
            <p class="file-name">{{ file.name }}</p>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>

          <div class="file-controls">
            <label>
              格式
              <select v-model="file.targetFormat" :disabled="isConverting">
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WebP</option>
                <option value="gif">GIF</option>
              </select>
            </label>

            <label v-if="file.targetFormat !== 'gif'">
              质量 {{ file.quality }}%
              <input type="range" v-model.number="file.quality" min="1" max="100" :disabled="isConverting" />
            </label>
          </div>

          <div class="row-actions">
            <button class="btn btn-primary" @click="convertFile(file)" :disabled="isConverting">转换</button>
            <button class="btn btn-danger" @click="removeFile(index)" :disabled="isConverting">删除</button>
          </div>

          <div class="progress" v-if="file.converting">
            <div class="progress-bar" :style="{ width: `${file.progress}%` }"></div>
            <span class="progress-text">{{ file.progress }}%</span>
          </div>
        </article>
      </div>
    </section>

    <section class="panel empty-panel" v-else @dragover.prevent @drop.prevent="handleDrop" @click="selectFiles">
      <h2 class="section-title">拖拽上传</h2>
      <p class="section-description">拖放图片到这里，或点击面板选择文件。</p>
      <p class="hint">支持 PNG、JPG、WebP、GIF</p>
    </section>

    <section class="panel result-panel" v-if="convertedFiles.length">
      <h2 class="section-title">已转换文件</h2>

      <div class="file-list">
        <article class="file-item" v-for="(file, index) in convertedFiles" :key="`converted-${index}`">
          <div class="file-head">
            <p class="file-name">{{ file.name }}</p>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <div class="row-actions">
            <button class="btn btn-primary" @click="downloadFile(file)">下载</button>
            <button class="btn btn-danger" @click="removeConvertedFile(index)">移除</button>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { buildConvertedFileName, normalizeQuality, toMimeType } from '../utils/imageConverter'

const router = useRouter()
const isConverting = ref(false)
const files = ref([])
const convertedFiles = ref([])
const batchFormat = ref('')
const batchQuality = ref(80)
const downloadTimeouts = new Set()

const goBack = () => {
  router.push('/')
}

const handleDrop = (e) => {
  const newFiles = Array.from(e.dataTransfer.files)
  newFiles.forEach((file) => {
    if (file.type.startsWith('image/')) {
      initFileDefaults(file)
      files.value.push(file)
    }
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const initFileDefaults = (file) => {
  file.targetFormat = 'png'
  file.converting = false
  file.progress = 0
  file.quality = 80
}

const convertImage = (file, targetFormat, quality) => {
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

        const normalizedQuality = normalizeQuality(quality)
        const mimeType = toMimeType(targetFormat)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('转换失败'))
              return
            }
            const newFile = new File([blob], buildConvertedFileName(file.name, targetFormat), {
              type: mimeType
            })
            resolve(newFile)
          },
          mimeType,
          normalizedQuality
        )
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

const selectFiles = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = 'image/*'
  input.onchange = (e) => {
    const newFiles = Array.from(e.target.files)
    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        initFileDefaults(file)
        files.value.push(file)
      }
    })
  }
  input.click()
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const removeConvertedFile = (index) => {
  convertedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  files.value = []
  convertedFiles.value = []
}

const convertFile = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    return
  }

  file.converting = true
  file.progress = 0

  try {
    const result = await convertImage(file, file.targetFormat, file.quality)
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

const convertAll = async () => {
  isConverting.value = true

  try {
    const conversionPromises = files.value.map(async (file) => {
      if (!file.converting) {
        file.converting = true
        file.progress = 0

        try {
          const result = await convertImage(file, file.targetFormat, file.quality)
          file.progress = 100
          return result
        } catch (error) {
          console.error('转换失败:', error)
          return null
        } finally {
          file.converting = false
        }
      }
      return null
    })

    const results = await Promise.all(conversionPromises)
    const successfulResults = results.filter((result) => result !== null)
    convertedFiles.value = [...convertedFiles.value, ...successfulResults]
  } catch (error) {
    console.error('批量转换失败:', error)
  } finally {
    isConverting.value = false
  }
}

const downloadFile = (file) => {
  if (!file) return

  try {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

const downloadAll = () => {
  const batchSize = 5
  const totalFiles = convertedFiles.value.length

  const downloadBatch = (startIndex) => {
    const endIndex = Math.min(startIndex + batchSize, totalFiles)

    for (let i = startIndex; i < endIndex; i += 1) {
      const file = convertedFiles.value[i]
      if (file) {
        downloadFile(file)
      }
    }

    if (endIndex < totalFiles) {
      const timeoutId = setTimeout(() => {
        downloadTimeouts.delete(timeoutId)
        downloadBatch(endIndex)
      }, 1000)
      downloadTimeouts.add(timeoutId)
    }
  }

  downloadBatch(0)
}

const applyBatchFormat = () => {
  if (!batchFormat.value) return
  files.value.forEach((file) => {
    file.targetFormat = batchFormat.value
  })
}

const applyBatchQuality = () => {
  files.value.forEach((file) => {
    if (file.targetFormat !== 'gif') {
      file.quality = batchQuality.value
    }
  })
}

onUnmounted(() => {
  downloadTimeouts.forEach((timeoutId) => clearTimeout(timeoutId))
  downloadTimeouts.clear()
})
</script>

<style scoped>
.image-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.control-panel,
.files-panel,
.result-panel,
.empty-panel {
  padding: var(--space-6);
}

.batch-row {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.file-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--surface-base);
  padding: var(--space-4);
}

.file-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.file-name {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  white-space: nowrap;
}

.file-controls {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.row-actions {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.progress {
  margin-top: 12px;
  position: relative;
  border-radius: 999px;
  border: 1px solid var(--border-weak);
  overflow: hidden;
  height: 10px;
}

.progress-bar {
  height: 100%;
  background: var(--accent);
}

.progress-text {
  margin-top: 8px;
  display: inline-block;
  color: var(--text-tertiary);
  font-size: 0.82rem;
}

.empty-panel {
  text-align: center;
  border-style: dashed;
  cursor: pointer;
}

.hint {
  margin-top: 8px;
  color: var(--text-tertiary);
  font-size: 0.86rem;
}

@media (max-width: 980px) {
  .control-panel,
  .files-panel,
  .result-panel,
  .empty-panel {
    padding: var(--space-4);
  }

  .batch-row,
  .file-controls {
    grid-template-columns: 1fr;
  }
}
</style>
